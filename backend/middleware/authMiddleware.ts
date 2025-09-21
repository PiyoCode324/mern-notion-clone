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
  console.log("=== authMiddleware start ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.originalUrl);
  console.log("Request headers:", req.headers);

  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No token found or wrong format");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("✅ Decoded token:", decodedToken);

    req.user = decodedToken; // { uid, email, ... }
    console.log("User attached to request, moving to next middleware");
    next();
  } catch (error) {
    console.error("❌ Firebase Auth Error:", error);
    res.status(401).json({ error: "Unauthorized" });
  } finally {
    console.log("=== authMiddleware end ===");
  }
};
