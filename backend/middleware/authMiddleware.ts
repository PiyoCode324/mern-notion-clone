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
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // { uid, email, ... }
    next();
    return;
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
};
