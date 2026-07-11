import express from "express";

import {
  deleteMateMessage,
  getMateMessages,
  getMates,
  sendMateMessage,
  streamMateInbox,
  streamMateMessages,
  updateMateStatus,
} from "../controllers/mateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMates);

router.get(
  "/messages/stream",
  streamMateInbox
);

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

router.delete(
  "/:id/messages/:messageId",
  deleteMateMessage
);

export default router;
