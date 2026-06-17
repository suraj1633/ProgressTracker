import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import topicRoutes from "./routes/topicRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import tipRoutes from "./routes/tipRoutes.js";

dotenv.config();

connectDB();

const app = express();

/*
==================================
MIDDLEWARE
==================================
*/

app.use(
  cors({
    origin:
      process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

/*
==================================
TEST ROUTE
==================================
*/

app.get("/", (req, res) => {
  res.send(
    "DSA Tracker API Running..."
  );
});

/*
==================================
API ROUTES
==================================
*/

app.use(
  "/api/topics",
  topicRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/tips",
  tipRoutes
);

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
