import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import topicRoutes from "./routes/topicRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import tipRoutes from "./routes/tipRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

connectDB();

const app = express();

const allowedOrigins =
  process.env.CLIENT_URL?.split(",")
    .map((origin) =>
      origin.trim()
    )
    .filter(Boolean) || [];

const isLocalViteOrigin = (origin) =>
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
    origin
  );

/*
==================================
MIDDLEWARE
==================================
*/

app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      if (
        !origin ||
        allowedOrigins.includes(
          origin
        ) ||
        isLocalViteOrigin(origin)
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },
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
  "/api/auth",
  authRoutes
);

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
