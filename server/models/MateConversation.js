import mongoose from "mongoose";

const mateMessageSchema =
  new mongoose.Schema(
    {
      text: {
        type: String,
        required: true,
        trim: true,
      },

      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },
    }
  );

const mateConversationSchema =
  new mongoose.Schema(
    {
      conversationKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      participants: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
      ],

      messages: [mateMessageSchema],
    },
    {
      timestamps: true,
    }
  );

const MateConversation =
  mongoose.model(
    "MateConversation",
    mateConversationSchema
  );

export default MateConversation;
