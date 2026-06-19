import mongoose from "mongoose";

const pendingUserSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      passwordHash: {
        type: String,
        required: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      otpExpiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

pendingUserSchema.index(
  {
    otpExpiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

const PendingUser =
  mongoose.model(
    "PendingUser",
    pendingUserSchema
  );

export default PendingUser;
