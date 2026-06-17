import express from "express";

import {
  createTip,
  deleteTip,
  getTips,
  updateTip,
} from "../controllers/tipController.js";

const router = express.Router();

router.get("/", getTips);

router.post("/", createTip);

router.put("/:id", updateTip);

router.delete("/:id", deleteTip);

export default router;
