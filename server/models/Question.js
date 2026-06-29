import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    sourceLink: {
      type: String,
      default: "",
    },

    sourceIcon: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({
  userId: 1,
  topicId: 1,
});

questionSchema.index({
  userId: 1,
  completed: 1,
  completedAt: -1,
});

const Question = mongoose.model(
  "Question",
  questionSchema
);

export default Question;
