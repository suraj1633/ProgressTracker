import mongoose from "mongoose";
import { EventEmitter } from "events";

import User from "../models/User.js";
import Question from "../models/Question.js";
import MateConnection from "../models/MateConnection.js";
import MateConversation from "../models/MateConversation.js";

const STATUS_VALUES = new Set([
  "mate",
  "request",
  "interest",
  "none",
]);

const mateMessageEvents =
  new EventEmitter();

mateMessageEvents.setMaxListeners(0);

const getConversationKey = (
  firstUserId,
  secondUserId
) =>
  [String(firstUserId), String(secondUserId)]
    .sort()
    .join(":");

const getUserMessageEventKey = (
  userId
) => `user:${String(userId)}`;

const emitMateMessageEvent = ({
  conversationKey,
  message,
  currentUserId,
  targetUserId,
}) => {
  mateMessageEvents.emit(
    conversationKey,
    {
      message,
    }
  );

  mateMessageEvents.emit(
    getUserMessageEventKey(
      currentUserId
    ),
    {
      mateId: targetUserId,
      message,
    }
  );

  mateMessageEvents.emit(
    getUserMessageEventKey(
      targetUserId
    ),
    {
      mateId: currentUserId,
      message,
    }
  );
};

const getMessagePayload = (
  message,
  viewerId
) => ({
  id: String(message._id),
  text: message.deletedAt
    ? ""
    : message.text,
  sender:
    String(message.sender) ===
    String(viewerId)
      ? "me"
      : "mate",
  createdAt: message.createdAt,
  isDeleted: Boolean(message.deletedAt),
  deletedAt: message.deletedAt,
  canDelete:
    !message.deletedAt &&
    String(message.sender) ===
      String(viewerId),
});

const getUsername = (user) =>
  (
    user.username ||
    user.email?.split("@")[0] ||
    user.name ||
    "mate"
  )
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getAvatarColor = (value) => {
  const colors = [
    "ff8738",
    "38bdf8",
    "22c55e",
    "c084fc",
    "fef08a",
    "ffd700",
    "818cf8",
    "e879f9",
    "ff8fb1",
    "dc2626",
  ];

  const hash = String(value)
    .split("")
    .reduce(
      (total, char) =>
        total + char.charCodeAt(0),
      0
    );

  return colors[hash % colors.length];
};

const getMilestone = (streak) => {
  if (streak >= 365) {
    return "Crimson Ascendant";
  }

  if (streak >= 180) {
    return "Stormforged";
  }

  if (streak >= 90) {
    return "Violet Coinmaster";
  }

  if (streak >= 30) {
    return "Azure Blade";
  }

  if (streak >= 7) {
    return "Bonfire Vanguard";
  }

  return "First Steps";
};

const buildStatsByUser = async (userIds) => {
  const stats = new Map();

  userIds.forEach((userId) => {
    stats.set(String(userId), {
      solved: 0,
      total: 0,
      difficulty: {
        Easy: {
          solved: 0,
          total: 0,
        },
        Medium: {
          solved: 0,
          total: 0,
        },
        Hard: {
          solved: 0,
          total: 0,
        },
      },
      streak: 0,
    });
  });

  const questionStats =
    await Question.aggregate([
      {
        $match: {
          userId: {
            $in: userIds,
          },
        },
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            difficulty: "$difficulty",
          },
          total: {
            $sum: 1,
          },
          solved: {
            $sum: {
              $cond: [
                "$completed",
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

  questionStats.forEach((item) => {
    const userStats = stats.get(
      String(item._id.userId)
    );
    const difficulty =
      item._id.difficulty || "Easy";

    if (!userStats?.difficulty[difficulty]) {
      return;
    }

    userStats.difficulty[
      difficulty
    ] = {
      solved: item.solved,
      total: item.total,
    };
    userStats.solved += item.solved;
    userStats.total += item.total;
  });

  const streakRows =
    await Question.aggregate([
      {
        $match: {
          userId: {
            $in: userIds,
          },
          completed: true,
          completedAt: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: {
            userId: "$userId",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$completedAt",
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.userId",
          dates: {
            $addToSet: "$_id.date",
          },
        },
      },
    ]);

  streakRows.forEach((row) => {
    const userStats = stats.get(
      String(row._id)
    );

    if (!userStats) {
      return;
    }

    const dateSet = new Set(row.dates);
    let current = new Date();
    let streak = 0;

    while (true) {
      const formatted = current
        .toISOString()
        .split("T")[0];

      if (!dateSet.has(formatted)) {
        break;
      }

      streak += 1;
      current.setDate(
        current.getDate() - 1
      );
    }

    userStats.streak = streak;
  });

  return stats;
};

const getConnectionStatus = (
  connection,
  currentUserId
) => {
  if (!connection) {
    return "none";
  }

  if (connection.status === "accepted") {
    return "mate";
  }

  return String(connection.requester) ===
    String(currentUserId)
    ? "interest"
    : "request";
};

const getMatePayload = ({
  user,
  stats,
  status,
  lastMessage,
}) => {
  const profile =
    user.mateProfile || {};
  const difficulty =
    Number.isFinite(
      profile.difficulty?.Easy?.total
    )
      ? profile.difficulty
      : stats.difficulty;

  return {
    id: String(user._id),
    username: getUsername(user),
    name: user.name,
    avatar:
      user.avatar ||
      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
        user.name
      )}&backgroundColor=${getAvatarColor(
        user._id
      )}`,
    milestone:
      profile.milestone ||
      getMilestone(stats.streak),
    joinedAt: user.createdAt,
    streak:
      profile.streak ?? stats.streak,
    solved:
      profile.solved ?? stats.solved,
    total: profile.total ?? stats.total,
    difficulty,
    platforms: {
      leetcode:
        user.platformLinks?.leetcode ||
        "",
      codeforces:
        user.platformLinks?.codeforces ||
        "",
      codechef:
        user.platformLinks?.codechef ||
        "",
      github:
        user.platformLinks?.github ||
        "",
    },
    status,
    lastMessageAt:
      lastMessage?.createdAt || null,
    lastMessage: lastMessage
      ? {
          id: String(lastMessage._id),
          text: lastMessage.text,
          sender:
            String(lastMessage.sender) ===
            String(user._id)
              ? "mate"
              : "me",
          createdAt:
            lastMessage.createdAt,
        }
      : null,
  };
};

const getMatesForUser = async (
  currentUserId
) => {
  const users = await User.find({
    _id: {
      $ne: currentUserId,
    },
    isVerified: true,
  })
    .select(
      "name email username avatar createdAt platformLinks mateProfile"
    )
    .sort({
      name: 1,
    });

  const userIds = users.map(
    (user) => user._id
  );
  const statsByUser =
    await buildStatsByUser(userIds);

  const [
    connections,
    conversations,
  ] = await Promise.all([
    MateConnection.find({
      $or: [
        {
          requester: currentUserId,
        },
        {
          addressee: currentUserId,
        },
      ],
    }),
    MateConversation.find({
      participants: currentUserId,
    }).select(
      "participants messages.text messages.sender messages.createdAt messages.deletedAt"
    ),
  ]);

  const connectionByUser = new Map();

  connections.forEach((connection) => {
    const otherUserId =
      String(connection.requester) ===
      String(currentUserId)
        ? connection.addressee
        : connection.requester;

    connectionByUser.set(
      String(otherUserId),
      connection
    );
  });

  const lastMessageByUser = new Map();

  conversations.forEach(
    (conversation) => {
      const otherUserId =
        conversation.participants
          .map(String)
          .find(
            (participantId) =>
              participantId !==
              String(currentUserId)
          );
      const lastMessage =
        [...conversation.messages]
          .reverse()
          .find(
            (message) =>
              !message.deletedAt
          );

      if (otherUserId && lastMessage) {
        lastMessageByUser.set(
          otherUserId,
          lastMessage
        );
      }
    }
  );

  return users.map((user) => {
    const stats =
      statsByUser.get(String(user._id)) ||
      {
        solved: 0,
        total: 0,
        streak: 0,
        difficulty: {
          Easy: {
            solved: 0,
            total: 0,
          },
          Medium: {
            solved: 0,
            total: 0,
          },
          Hard: {
            solved: 0,
            total: 0,
          },
        },
      };

    return getMatePayload({
      user,
      stats,
      status: getConnectionStatus(
        connectionByUser.get(
          String(user._id)
        ),
        currentUserId
      ),
      lastMessage:
        lastMessageByUser.get(
          String(user._id)
        ) || null,
    });
  });
};

export const getMates = async (
  req,
  res
) => {
  try {
    const mates =
      await getMatesForUser(req.user._id);

    res.json({
      mates,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateMateStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;
    const targetUserId = req.params.id;

    if (!STATUS_VALUES.has(status)) {
      return res.status(400).json({
        message: "Invalid mate status",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        targetUserId
      ) ||
      String(targetUserId) ===
        String(req.user._id)
    ) {
      return res.status(400).json({
        message: "Invalid mate",
      });
    }

    const targetExists =
      await User.exists({
        _id: targetUserId,
        isVerified: true,
      });

    if (!targetExists) {
      return res.status(404).json({
        message: "Mate not found",
      });
    }

    const pairQuery = {
      $or: [
        {
          requester: req.user._id,
          addressee: targetUserId,
        },
        {
          requester: targetUserId,
          addressee: req.user._id,
        },
      ],
    };

    if (status === "none") {
      await MateConnection.deleteMany(
        pairQuery
      );
    } else if (status === "interest") {
      await MateConnection.deleteMany({
        requester: targetUserId,
        addressee: req.user._id,
      });

      await MateConnection.findOneAndUpdate(
        {
          requester: req.user._id,
          addressee: targetUserId,
        },
        {
          requester: req.user._id,
          addressee: targetUserId,
          status: "pending",
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    } else if (status === "request") {
      await MateConnection.deleteMany({
        requester: req.user._id,
        addressee: targetUserId,
      });

      await MateConnection.findOneAndUpdate(
        {
          requester: targetUserId,
          addressee: req.user._id,
        },
        {
          requester: targetUserId,
          addressee: req.user._id,
          status: "pending",
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    } else if (status === "mate") {
      const connection =
        await MateConnection.findOne(
          pairQuery
        );

      if (connection) {
        connection.status = "accepted";
        await connection.save();
      } else {
        await MateConnection.create({
          requester: req.user._id,
          addressee: targetUserId,
          status: "accepted",
        });
      }
    }

    const mates =
      await getMatesForUser(req.user._id);
    const mate = mates.find(
      (item) => item.id === targetUserId
    );

    res.json({
      mate,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMateMessages = async (
  req,
  res
) => {
  try {
    const targetUserId = req.params.id;

    if (
      !mongoose.Types.ObjectId.isValid(
        targetUserId
      )
    ) {
      return res.status(400).json({
        message: "Invalid mate",
      });
    }

    const conversation =
      await MateConversation.findOne({
        conversationKey:
          getConversationKey(
            req.user._id,
            targetUserId
          ),
      });

    res.json({
      messages:
        conversation?.messages
          .filter(
            (message) =>
              !message.deletedAt
          )
          .map((message) =>
            getMessagePayload(
              message,
              req.user._id
            )
          ) || [],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const sendMateMessage = async (
  req,
  res
) => {
  try {
    const targetUserId = req.params.id;
    const text = req.body.text?.trim();

    if (
      !mongoose.Types.ObjectId.isValid(
        targetUserId
      ) ||
      !text
    ) {
      return res.status(400).json({
        message: "Invalid message",
      });
    }

    const targetExists =
      await User.exists({
        _id: targetUserId,
        isVerified: true,
      });

    if (!targetExists) {
      return res.status(404).json({
        message: "Mate not found",
      });
    }

    const conversationKey =
      getConversationKey(
        req.user._id,
        targetUserId
      );

    const conversation =
      await MateConversation.findOneAndUpdate(
        {
          conversationKey,
        },
        {
          $setOnInsert: {
            conversationKey,
            participants: [
              req.user._id,
              targetUserId,
            ],
          },
          $push: {
            messages: {
              text,
              sender: req.user._id,
            },
          },
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );

    const message =
      conversation.messages[
        conversation.messages.length - 1
      ];

    res.status(201).json({
      message: getMessagePayload(
        message,
        req.user._id
      ),
    });

    emitMateMessageEvent({
      conversationKey,
      message,
      currentUserId: req.user._id,
      targetUserId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteMateMessage = async (
  req,
  res
) => {
  try {
    const targetUserId = req.params.id;
    const messageId =
      req.params.messageId;

    if (
      !mongoose.Types.ObjectId.isValid(
        targetUserId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        messageId
      )
    ) {
      return res.status(400).json({
        message: "Invalid message",
      });
    }

    const conversationKey =
      getConversationKey(
        req.user._id,
        targetUserId
      );

    const conversation =
      await MateConversation.findOne({
        conversationKey,
      });

    const message =
      conversation?.messages.id(
        messageId
      );

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    if (
      String(message.sender) !==
      String(req.user._id)
    ) {
      return res.status(403).json({
        message:
          "You can only delete your own messages",
      });
    }

    if (!message.deletedAt) {
      message.deletedAt = new Date();
      message.deletedBy = req.user._id;
      await conversation.save();
    }

    const payload =
      getMessagePayload(
        message,
        req.user._id
      );

    res.json({
      message: payload,
    });

    emitMateMessageEvent({
      conversationKey,
      message,
      currentUserId: req.user._id,
      targetUserId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const streamMateMessages = async (
  req,
  res
) => {
  try {
    const targetUserId = req.params.id;

    if (
      !mongoose.Types.ObjectId.isValid(
        targetUserId
      )
    ) {
      return res.status(400).json({
        message: "Invalid mate",
      });
    }

    const targetExists =
      await User.exists({
        _id: targetUserId,
        isVerified: true,
      });

    if (!targetExists) {
      return res.status(404).json({
        message: "Mate not found",
      });
    }

    const conversationKey =
      getConversationKey(
        req.user._id,
        targetUserId
      );

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control":
        "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    res.write("retry: 1500\n");

    res.write(
      `event: connected\ndata: ${JSON.stringify(
        {
          ok: true,
        }
      )}\n\n`
    );

    const sendMessage = ({ message }) => {
      res.write(
        `event: message\ndata: ${JSON.stringify(
          getMessagePayload(
            message,
            req.user._id
          )
        )}\n\n`
      );
    };

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 25000);

    mateMessageEvents.on(
      conversationKey,
      sendMessage
    );

    req.on("close", () => {
      clearInterval(heartbeat);
      mateMessageEvents.off(
        conversationKey,
        sendMessage
      );
      res.end();
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const streamMateInbox = async (
  req,
  res
) => {
  try {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control":
        "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    res.write("retry: 1500\n");

    res.write(
      `event: connected\ndata: ${JSON.stringify(
        {
          ok: true,
        }
      )}\n\n`
    );

    const sendMessage = ({
      mateId,
      message,
    }) => {
      res.write(
        `event: message\ndata: ${JSON.stringify(
          {
            userId: String(mateId),
            message: getMessagePayload(
              message,
              req.user._id
            ),
          }
        )}\n\n`
      );
    };

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 25000);

    const eventKey =
      getUserMessageEventKey(
        req.user._id
      );

    mateMessageEvents.on(
      eventKey,
      sendMessage
    );

    req.on("close", () => {
      clearInterval(heartbeat);
      mateMessageEvents.off(
        eventKey,
        sendMessage
      );
      res.end();
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
