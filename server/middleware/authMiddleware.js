import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect =
  async (req, res, next) => {
    try {
      const authHeader =
        req.headers.authorization;
      const queryToken =
        req.query.token;

      if (
        !authHeader?.startsWith(
          "Bearer "
        ) &&
        !queryToken
      ) {
        return res.status(401).json({
          message:
            "Authentication required",
        });
      }

      const token =
        authHeader?.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : queryToken;

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const user =
        await User.findById(
          decoded.userId
        ).select(
          "-passwordHash -otpHash"
        );

      if (
        !user ||
        !user.isVerified
      ) {
        return res.status(401).json({
          message:
            "Authentication required",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired session",
      });
    }
  };
