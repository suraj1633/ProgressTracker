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
      await Topic.find().populate(
        "questions"
      );

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

      const question =
        await Question.create({
          title,
          difficulty,
          sourceLink,
          sourceIcon,
          notes,
          topicId,
        });

      const topic =
        await Topic.findById(
          topicId
        );

      topic.questions.push(
        question._id
      );

      topic.totalQuestions += 1;

      await topic.save();

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
        await Question.findById(
          req.params.id
        );

      if (!question) {
        return res
          .status(404)
          .json({
            message:
              "Question not found",
          });
      }

      const topic =
        await Topic.findById(
          question.topicId
        );

      question.completed =
        !question.completed;

      if (
        question.completed
      ) {
        question.completedAt =
          new Date();

        topic.completedQuestions += 1;

        await ProgressLog.create({
          questionId:
            question._id,
          difficulty:
            question.difficulty,
          completedAt:
            new Date(),
        });
      } else {
        question.completedAt =
          null;

        topic.completedQuestions -= 1;

        await ProgressLog.deleteOne({
          questionId:
            question._id,
        });
      }

      topic.progressPercentage =
        (
          (topic.completedQuestions /
            topic.totalQuestions) *
          100
        ).toFixed(2);

      await question.save();

      await topic.save();

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
        await Question.findById(
          id
        );

      if (!question) {
        return res
          .status(404)
          .json({
            message:
              "Question not found",
          });
      }

      const topic =
        await Topic.findById(
          question.topicId
        );

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
      });

      // delete actual question doc
      await Question.findByIdAndDelete(
        id
      );

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

      const updatedQuestion =
        await Question.findByIdAndUpdate(
          questionId,
          req.body,
          {
            returnDocument:
              "after",
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
        await Topic.findById(
          req.params.id
        );

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
      });

      await Topic.findByIdAndDelete(
        req.params.id
      );

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
      const questions =
        await Question.find({
          completed: true,
        });

      const today =
        new Date();

      const todayString =
        today
          .toISOString()
          .split("T")[0];

      let solvedToday = 0;

      questions.forEach(
        (question) => {
          if (
            !question.completedAt
          )
            return;

          const completedDate =
            question.completedAt
              .toISOString()
              .split("T")[0];

          if (
            completedDate ===
            todayString
          ) {
            solvedToday++;
          }
        }
      );

      const sortedDates =
        questions
          .filter(
            (q) =>
              q.completedAt
          )
          .map((q) =>
            q.completedAt
              .toISOString()
              .split("T")[0]
          );

      const uniqueDates =
        [
          ...new Set(
            sortedDates
          ),
        ].sort();

      let streak = 0;

      let current =
        new Date();

      while (true) {
        const formatted =
          current
            .toISOString()
            .split("T")[0];

        if (
          uniqueDates.includes(
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