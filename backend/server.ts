// backend/server.ts
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import noteRoutes from "./routes/noteRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ✅ 環境によるCORS切り替え
// .env に FRONTEND_URL=本番URL を設定しておく
const whitelist =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL as string] // 本番環境では本番URLのみ許可
    : ["http://localhost:3000"]; // 開発環境では localhost:3000 許可

app.use(
  cors({
    origin: function (origin, callback) {
      // origin が whitelist にある場合は許可
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Cookieなどを使う場合
  })
);

app.use(express.json());

// ルート
app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes);

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
