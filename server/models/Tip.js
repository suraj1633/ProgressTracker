import mongoose from "mongoose";

const tipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      default: "",
      trim: true,
    },

    topicId: {
      type: String,
      default: "general",
    },

    color: {
      type: String,
      default: "#202020",
    },
  },
  {
    timestamps: true,
  }
);

const Tip = mongoose.model(
  "Tip",
  tipSchema
);

export default Tip;
