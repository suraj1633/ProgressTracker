import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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

    isVerified: {
      type: Boolean,
      default: true,
    },

    platformLinks: {
      leetcode: {
        type: String,
        trim: true,
        default: "",
      },

      codeforces: {
        type: String,
        trim: true,
        default: "",
      },

      codechef: {
        type: String,
        trim: true,
        default: "",
      },

      github: {
        type: String,
        trim: true,
        default: "",
      },
    },

    username: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    mateProfile: {
      milestone: {
        type: String,
        trim: true,
        default: "",
      },

      streak: {
        type: Number,
        default: null,
      },

      solved: {
        type: Number,
        default: null,
      },

      total: {
        type: Number,
        default: null,
      },

      difficulty: {
        Easy: {
          solved: {
            type: Number,
            default: null,
          },
          total: {
            type: Number,
            default: null,
          },
        },
        Medium: {
          solved: {
            type: Number,
            default: null,
          },
          total: {
            type: Number,
            default: null,
          },
        },
        Hard: {
          solved: {
            type: Number,
            default: null,
          },
          total: {
            type: Number,
            default: null,
          },
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

export default User;
