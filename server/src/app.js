
import express from "express";
import cors from "cors";

import taskRoutes from "./routes/tasks.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    ) {
      return callback(null, true);
    }

    const error = new Error("Origin not allowed.");
    error.statusCode = 403;
    callback(error);
  }
}));

app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TaskFlow API"
  });
});

app.use("/api/tasks", taskRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

app.use(errorHandler);

export default app;
