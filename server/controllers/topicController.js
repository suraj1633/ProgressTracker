import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import ProgressLog from "../models/ProgressLog.js";
import getFavicon from "../utils/faviconExtractor.js";

/*
==================================
CREATE TOPIC
POST /api/topics
==================================
*/

export const createTopic = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
    } = req.body;

    const topic = await Topic.create({
      title,
      description,
      userId: req.user._id,
    });

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
==================================
GET ALL TOPICS
GET /api/topics
==================================
*/

export const getTopics = async (
  req,
  res
) => {
  try {
    const topics =
      await Topic.find({
        userId: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "questions",
          match: {
            userId: req.user._id,
          },
          options: {
            sort: {
              createdAt: 1,
            },
          },
        })
        .lean();

    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
==================================
ADD QUESTION TO TOPIC
POST /api/topics/:topicId/question
==================================
*/

export const addQuestion =
  async (req, res) => {
    try {
      const { topicId } =
        req.params;

      const {
        title,
        difficulty,
        sourceLink,
        notes,
      } = req.body;

      const sourceIcon =
        getFavicon(sourceLink);

      const topic =
        await Topic.findOne({
          _id: topicId,
          userId: req.user._id,
        }).select(
          "_id totalQuestions completedQuestions"
        );

      if (!topic) {
        return res.status(404).json({
          message:
            "Topic not found",
        });
      }

      const question =
        await Question.create({
          title,
          userId: req.user._id,
          difficulty,
          sourceLink,
          sourceIcon,
          notes,
          topicId,
        });

      const nextTotalQuestions =
        topic.totalQuestions + 1;

      const nextProgressPercentage =
        nextTotalQuestions === 0
          ? 0
          : (
              (topic.completedQuestions /
                nextTotalQuestions) *
              100
            ).toFixed(2);

      await Topic.updateOne(
        {
          _id: topicId,
          userId: req.user._id,
        },
        {
          $push: {
            questions:
              question._id,
          },
          $inc: {
            totalQuestions: 1,
          },
          $set: {
            progressPercentage:
              nextProgressPercentage,
          },
        }
      );

      res.status(201).json(
        question
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/*
==================================
TOGGLE QUESTION COMPLETION
PATCH /api/question/:id/toggle
==================================
*/

export const toggleQuestion =
  async (req, res) => {
    try {
      const question =
        await Question.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });

      if (!question) {
        return res
          .status(404)
          .json({
            message:
              "Question not found",
          });
      }

      const topic =
        await Topic.findOne({
          _id: question.topicId,
          userId: req.user._id,
        });

      if (!topic) {
        return res
          .status(404)
          .json({
            message:
              "Topic not found",
          });
      }

      question.completed =
        !question.completed;

      let logOperation;

      if (question.completed) {
        question.completedAt =
          new Date();

        topic.completedQuestions += 1;

        logOperation =
          ProgressLog.create({
          questionId:
            question._id,
          userId: req.user._id,
          difficulty:
            question.difficulty,
          completedAt:
            new Date(),
        });
      } else {
        question.completedAt =
          null;

        topic.completedQuestions -= 1;

        logOperation =
          ProgressLog.deleteOne({
          questionId:
            question._id,
          userId: req.user._id,
        });
      }

      topic.progressPercentage =
        (
          (topic.completedQuestions /
            topic.totalQuestions) *
          100
        ).toFixed(2);

      await Promise.all([
        question.save(),
        topic.save(),
        logOperation,
      ]);

      res.status(200).json({
        question,
        topic,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };


export const deleteQuestion =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const question =
        await Question.findOne({
          _id: id,
          userId: req.user._id,
        });

      if (!question) {
        return res
          .status(404)
          .json({
            message:
              "Question not found",
          });
      }

      const topic =
        await Topic.findOne({
          _id: question.topicId,
          userId: req.user._id,
        });

      if (!topic) {
        return res
          .status(404)
          .json({
            message:
              "Topic not found",
          });
      }

      // remove question id
      topic.questions =
        topic.questions.filter(
          (qId) =>
            qId.toString() !==
            id
        );

      // update counts
      topic.totalQuestions -= 1;

      if (
        question.completed
      ) {
        topic.completedQuestions -= 1;
      }

      topic.progressPercentage =
        topic.totalQuestions ===
        0
          ? 0
          : (
              (topic.completedQuestions /
                topic.totalQuestions) *
              100
            ).toFixed(2);

      // delete logs if exist
      await ProgressLog.deleteOne({
        questionId: id,
        userId: req.user._id,
      });

      // delete actual question doc
      await Question.deleteOne({
        _id: id,
        userId: req.user._id,
      });

      await topic.save();

      res.status(200).json({
        message:
          "Question deleted successfully",
      });
    } catch (error) {
      console.error(
        error
      );

      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  };

export const updateQuestion =
  async (req, res) => {
    try {
      const questionId =
        req.params.id;

      const {
        title,
        difficulty,
        sourceLink,
        notes,
      } = req.body;

      const update = {};

      if (title !== undefined) {
        update.title = title;
      }

      if (difficulty !== undefined) {
        update.difficulty =
          difficulty;
      }

      if (sourceLink !== undefined) {
        update.sourceLink =
          sourceLink;
        update.sourceIcon =
          getFavicon(sourceLink);
      }

      if (notes !== undefined) {
        update.notes = notes;
      }

      const updatedQuestion =
        await Question.findOneAndUpdate(
          {
            _id: questionId,
            userId: req.user._id,
          },
          update,
          {
            new: true,
            runValidators: true,
          }
        );

      if (
        !updatedQuestion
      ) {
        return res
          .status(404)
          .json({
            message:
              "Question not found",
          });
      }

      res.status(200).json(
        updatedQuestion
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/*
==================================
DELETE TOPIC
DELETE /api/topics/:id
==================================
*/

export const deleteTopic =
  async (req, res) => {
    try {
      const topic =
        await Topic.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });

      if (!topic) {
        return res
          .status(404)
          .json({
            message:
              "Topic not found",
          });
      }

      await Question.deleteMany({
        topicId:
          topic._id,
        userId: req.user._id,
      });

      await ProgressLog.deleteMany({
        userId: req.user._id,
        questionId: {
          $in: topic.questions,
        },
      });

      await Topic.deleteOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      res.status(200).json({
        message:
          "Topic deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

  /*
==================================
GET DASHBOARD STATS
GET /api/topics/stats
==================================
*/

export const getDashboardStats =
  async (req, res) => {
    try {
      const today =
        new Date();

      const todayString =
        today
          .toISOString()
          .split("T")[0];

      const tomorrow =
        new Date(today);

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      const todayStart =
        new Date(
          `${todayString}T00:00:00.000Z`
        );

      const tomorrowStart =
        new Date(
          `${
            tomorrow
              .toISOString()
              .split("T")[0]
          }T00:00:00.000Z`
        );

      const [
        solvedToday,
        streakDates,
      ] = await Promise.all([
        ProgressLog.countDocuments({
          userId: req.user._id,
          completedAt: {
            $gte: todayStart,
            $lt: tomorrowStart,
          },
        }),
        ProgressLog.aggregate([
          {
            $match: {
              userId: req.user._id,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format:
                    "%Y-%m-%d",
                  date:
                    "$completedAt",
                },
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]),
      ]);

      const uniqueDates =
        streakDates.map(
          (item) => item._id
        );

      const uniqueDateSet =
        new Set(uniqueDates);

      let streak = 0;

      let current =
        new Date();

      while (true) {
        const formatted =
          current
            .toISOString()
            .split("T")[0];

        if (
          uniqueDateSet.has(
            formatted
          )
        ) {
          streak++;

          current.setDate(
            current.getDate() -
              1
          );
        } else {
          break;
        }
      }

      res.json({
        streak,
        solvedToday,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };
