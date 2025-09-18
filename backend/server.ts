// backend/server.ts
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import noteRoutes from "./routes/noteRoutes";
import authRoutes from "./routes/authRoutes"; // authRoutesをインポート

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

// ルート
app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes); // authルートを追加

// 簡単なテストルート
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running");
});

// MongoDB接続
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// サーバ起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
