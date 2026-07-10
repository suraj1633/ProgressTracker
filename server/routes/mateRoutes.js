import express from "express";

import {
  getMateMessages,
  getMates,
  sendMateMessage,
  streamMateMessages,
  updateMateStatus,
} from "../controllers/mateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMates);

router.patch(
  "/:id/status",
  updateMateStatus
);

router.get(
  "/:id/messages/stream",
  streamMateMessages
);

router.get(
  "/:id/messages",
  getMateMessages
);

router.post(
  "/:id/messages",
  sendMateMessage
);

export default router;
