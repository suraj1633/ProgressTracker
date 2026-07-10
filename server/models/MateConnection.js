import mongoose from "mongoose";

const mateConnectionSchema =
  new mongoose.Schema(
    {
      requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      addressee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending",
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

mateConnectionSchema.index(
  {
    requester: 1,
    addressee: 1,
  },
  {
    unique: true,
  }
);

const MateConnection = mongoose.model(
  "MateConnection",
  mateConnectionSchema
);

export default MateConnection;
