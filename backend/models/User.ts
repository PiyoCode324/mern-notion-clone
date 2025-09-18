// backend/models/User.ts
import mongoose, { Schema, Model, Document } from "mongoose";

// スキーマ定義
const UserSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true },
    displayName: { type: String, default: "" },
  },
  { timestamps: true } // createdAt, updatedAt を自動追加
);

// スキーマから型を推論し、Mongooseのドキュメント型と組み合わせる
export interface IUser extends Document {
  uid: string;
  email: string;
  displayName?: string;
}

// モデル定義
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
