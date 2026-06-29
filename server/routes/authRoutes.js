import express from "express";

import {
  getProfile,
  login,
  resendOtp,
  signup,
  updateProfile,
  verifyOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendOtp);

router.post("/login", login);

router.get("/me", protect, getProfile);

router.put("/me", protect, updateProfile);

export default router;
