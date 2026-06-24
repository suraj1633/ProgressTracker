import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import PendingUser from "../models/PendingUser.js";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/mailer.js";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "7d",
    }
  );

const hashOtp = (otp) =>
  crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

const toProfile = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const createOtp = () => {
  const otp = String(
    crypto.randomInt(
      100000,
      1000000
    )
  );

  return otp;
};

const sendSignupOtp = async (
  email,
  otp
) => {
  try {
    await sendOtpEmail(
      email,
      otp
    );
  } catch (error) {
    console.error(
      "OTP email failed",
      {
        email,
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode:
          error.responseCode,
        response: error.response,
      }
    );

    const deliveryError =
      new Error(
        "Unable to send OTP email right now. Please try again later."
      );

    deliveryError.statusCode = 503;

    throw deliveryError;
  }
};

export const signup =
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      const cleanName =
        name?.trim();
      const cleanEmail =
        email?.trim().toLowerCase();

      if (
        !cleanName ||
        !emailRegex.test(
          cleanEmail || ""
        ) ||
        !password ||
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Enter a valid name, email, and a password with at least 6 characters",
        });
      }

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "Email is already registered. Please login.",
        });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
        12
      );

      const otp = createOtp();
      const otpExpiresAt =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      await PendingUser.findOneAndUpdate(
        {
          email: cleanEmail,
        },
        {
          name: cleanName,
          email: cleanEmail,
          passwordHash,
          otpHash: hashOtp(otp),
          otpExpiresAt,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      await sendSignupOtp(
        cleanEmail,
        otp
      );

      return res.status(201).json({
        message:
          "OTP sent to your email",
        email: cleanEmail,
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        message: error.message,
      });
    }
  };

export const verifyOtp =
  async (req, res) => {
    try {
      const { email, otp } =
        req.body;

      const cleanEmail =
        email?.trim().toLowerCase();

      const pendingUser =
        await PendingUser.findOne({
          email: cleanEmail,
        });

      if (
        !pendingUser ||
        !otp ||
        pendingUser.otpHash !==
          hashOtp(String(otp)) ||
        !pendingUser.otpExpiresAt ||
        pendingUser.otpExpiresAt <
          new Date()
      ) {
        return res.status(400).json({
          message:
            "Invalid or expired OTP",
        });
      }

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        await PendingUser.deleteOne({
          email: cleanEmail,
        });

        return res.status(409).json({
          message:
            "Email is already registered. Please login.",
        });
      }

      const user =
        await User.create({
          name: pendingUser.name,
          email: pendingUser.email,
          passwordHash:
            pendingUser.passwordHash,
          isVerified: true,
        });

      await PendingUser.deleteOne({
        email: cleanEmail,
      });

      const token =
        createToken(user);

      return res.status(200).json({
        token,
        user: toProfile(user),
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };

export const resendOtp =
  async (req, res) => {
    try {
      const { email } =
        req.body;

      const cleanEmail =
        email?.trim().toLowerCase();

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "Account is already verified",
        });
      }

      const pendingUser =
        await PendingUser.findOne({
          email: cleanEmail,
        });

      if (!pendingUser) {
        return res.status(404).json({
          message:
            "Signup request not found. Please sign up again.",
        });
      }

      const otp = createOtp();

      pendingUser.otpHash =
        hashOtp(otp);
      pendingUser.otpExpiresAt =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      await pendingUser.save();
      await sendSignupOtp(
        cleanEmail,
        otp
      );

      return res.status(200).json({
        message:
          "OTP sent to your email",
      });
    } catch (error) {
      return res.status(
        error.statusCode || 500
      ).json({
        message: error.message,
      });
    }
  };

export const login =
  async (req, res) => {
    try {
      const { email, password } =
        req.body;

      const cleanEmail =
        email?.trim().toLowerCase();

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (
        !user ||
        !(await bcrypt.compare(
          password || "",
          user.passwordHash
        ))
      ) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const token =
        createToken(user);

      return res.status(200).json({
        token,
        user: toProfile(user),
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  };

export const getProfile =
  async (req, res) => {
    return res.status(200).json({
      user: toProfile(req.user),
    });
  };
