import express from "express";

import {
  createTopic,
  getTopics,
  addQuestion,
  toggleQuestion,
  deleteTopic,
  getDashboardStats,
  deleteQuestion,
  updateQuestion,
} from "../controllers/topicController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

/*
==================================
TOPIC ROUTES
==================================
*/

// Create topic
router.post("/", createTopic);

// Get all topics
router.get("/", getTopics);

// Delete topic
router.delete("/:id", deleteTopic);

// Add question to topic
router.post(
  "/:topicId/question",
  addQuestion
);

router.delete(
  "/question/:id",
  deleteQuestion
);

router.put(
  "/questions/:id",
  updateQuestion
);

// Toggle checkbox completion
router.patch(
  "/question/:id/toggle",
  toggleQuestion
);

router.get(
  "/stats",
  getDashboardStats
);

export default router;
