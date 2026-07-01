import mongoose from "mongoose";

const progressLogSchema =
  new mongoose.Schema(
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      difficulty: {
        type: String,
        enum: [
          "Easy",
          "Medium",
          "Hard",
        ],
      },

      completedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

const ProgressLog = mongoose.model(
  "ProgressLog",
  progressLogSchema
);

export default ProgressLog;
