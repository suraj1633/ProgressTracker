import express from "express";

import {
  getAnalytics,
  getHeatmapData,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

/*
==================================
ANALYTICS ROUTE
==================================
*/

router.get("/", getAnalytics);

router.get(
  "/heatmap",
  getHeatmapData
);

export default router;
