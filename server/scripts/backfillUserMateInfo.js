import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Question from "../models/Question.js";

dotenv.config();

const PLATFORM_KEYS = [
  "leetcode",
  "codeforces",
  "codechef",
  "github",
];

const DEFAULT_PLATFORM_LINKS = {
  leetcode: "https://leetcode.com",
  codeforces: "https://codeforces.com",
  codechef: "https://www.codechef.com",
  github: "https://github.com",
};

const AVATAR_COLORS = [
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

const getMongoUri = () =>
  process.env.MONGO_URI_LOCAL ||
  process.env.MONGO_URI;

const getUsername = (user) =>
  (
    user.username ||
    user.email?.split("@")[0] ||
    user.name ||
    "user"
  )
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "") ||
  `user_${String(user._id).slice(-6)}`;

const getAvatar = (user) => {
  const seed =
    user.name || getUsername(user);
  const hash = String(user._id)
    .split("")
    .reduce(
      (total, char) =>
        total + char.charCodeAt(0),
      0
    );

  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=${
    AVATAR_COLORS[
      hash % AVATAR_COLORS.length
    ]
  }`;
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

const emptyDifficulty = () => ({
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
});

const getQuestionStats = async (userId) => {
  const stats = {
    solved: 0,
    total: 0,
    difficulty: emptyDifficulty(),
    streak: 0,
  };

  const grouped =
    await Question.aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $group: {
          _id: "$difficulty",
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

  grouped.forEach((item) => {
    const difficulty =
      item._id || "Easy";

    if (!stats.difficulty[difficulty]) {
      return;
    }

    stats.difficulty[
      difficulty
    ] = {
      solved: item.solved,
      total: item.total,
    };
    stats.solved += item.solved;
    stats.total += item.total;
  });

  const completedDates =
    await Question.aggregate([
      {
        $match: {
          userId,
          completed: true,
          completedAt: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$completedAt",
            },
          },
        },
      },
    ]);

  const dateSet = new Set(
    completedDates.map((item) => item._id)
  );
  let current = new Date();

  while (true) {
    const formatted = current
      .toISOString()
      .split("T")[0];

    if (!dateSet.has(formatted)) {
      break;
    }

    stats.streak += 1;
    current.setDate(
      current.getDate() - 1
    );
  }

  return stats;
};

const hasCompleteDifficulty = (
  difficulty
) =>
  ["Easy", "Medium", "Hard"].every(
    (level) =>
      Number.isFinite(
        difficulty?.[level]?.solved
      ) &&
      Number.isFinite(
        difficulty?.[level]?.total
      )
  );

const backfill = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI or MONGO_URI_LOCAL is required"
    );
  }

  await mongoose.connect(mongoUri);

  const users = await User.find({
    isVerified: true,
  });

  let updated = 0;
  const changedUsers = [];

  for (const user of users) {
    const stats =
      await getQuestionStats(user._id);
    let changed = false;

    if (!user.username) {
      user.username = getUsername(user);
      changed = true;
    }

    if (!user.avatar) {
      user.avatar = getAvatar(user);
      changed = true;
    }

    user.platformLinks =
      user.platformLinks || {};

    PLATFORM_KEYS.forEach((key) => {
      if (!user.platformLinks[key]) {
        user.platformLinks[key] =
          DEFAULT_PLATFORM_LINKS[key];
        changed = true;
      }
    });

    user.mateProfile =
      user.mateProfile || {};

    if (!user.mateProfile.milestone) {
      user.mateProfile.milestone =
        getMilestone(stats.streak);
      changed = true;
    }

    if (
      !Number.isFinite(
        user.mateProfile.streak
      )
    ) {
      user.mateProfile.streak =
        stats.streak;
      changed = true;
    }

    if (
      !Number.isFinite(
        user.mateProfile.solved
      )
    ) {
      user.mateProfile.solved =
        stats.solved;
      changed = true;
    }

    if (
      !Number.isFinite(
        user.mateProfile.total
      )
    ) {
      user.mateProfile.total =
        stats.total;
      changed = true;
    }

    if (
      !hasCompleteDifficulty(
        user.mateProfile.difficulty
      )
    ) {
      user.mateProfile.difficulty =
        stats.difficulty;
      changed = true;
    }

    if (changed) {
      await user.save();
      updated += 1;
      changedUsers.push(user.email);
    }
  }

  console.log(
    JSON.stringify(
      {
        checked: users.length,
        updated,
        changedUsers,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

backfill().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
