// backend/controllers/userController.ts
import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import admin from "../utils/firebaseAdmin";

// MongoDBにユーザーを登録する
export const registerUserInMongoDB = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 1. Firebaseにユーザーを作成
    console.log("Attempting to create user in Firebase...");
    const userRecord = await admin.auth().createUser({ email, password });
    console.log("User created in Firebase:", userRecord.uid);

    // 2. MongoDBにユーザー情報を保存
    console.log("Attempting to save user to MongoDB...");
    const newUser: IUser = new User({
      uid: userRecord.uid,
      email: userRecord.email,
    });
    await newUser.save();
    console.log("User saved to MongoDB:", newUser.uid);

    return res
      .status(201)
      .json({ message: "User created successfully in Firebase and MongoDB" });
  } catch (error) {
    console.error("Registration error:", error);
    // Firebaseのエラーコードをチェック
    if (
      error instanceof Error &&
      (error as any).code === "auth/email-already-in-use"
    ) {
      return res.status(409).json({ message: "Email already in use" });
    }
    // その他のエラーをキャッチ
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
