// backend/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import admin from "../utils/firebaseAdmin";

// Request 型を拡張して user プロパティを追加
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // { uid, email, ... }
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
