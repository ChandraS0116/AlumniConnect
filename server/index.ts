import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./db.js";
import alumniRouter from "./routes/alumni.js";
import studentsRouter from "./routes/students.js";
import videosRouter from "./routes/videos.js";
import doubtsRouter from "./routes/doubts.js";
import adminRouter from "./routes/admin.js";
import aiRouter from "./routes/ai.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
initDatabase();

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Alumni Connect AI Backend",
    timestamp: new Date().toISOString(),
    database: "SQLite (Native WAL mode)",
  });
});

// API Routes
app.use("/api/alumni", alumniRouter);
app.use("/api/students", studentsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/doubts", doubtsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Backend] Alumni Connect AI API Server running on http://127.0.0.1:${PORT}`);
  console.log(`[Backend] Health check: http://127.0.0.1:${PORT}/api/health`);
});

export default app;
