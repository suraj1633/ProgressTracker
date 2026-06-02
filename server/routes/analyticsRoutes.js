import express from "express";

import {
  getAnalytics,
  getHeatmapData,
} from "../controllers/analyticsController.js";

const router = express.Router();

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