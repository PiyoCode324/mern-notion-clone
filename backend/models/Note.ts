// backend/models/Note.ts
import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

// スキーマ定義
const NoteSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, default: {} }, // Tiptap JSON
    markdown: { type: String, default: "" }, // Markdown文字列
    tags: { type: [String], default: [] },
    createdBy: { type: String, required: true }, // Firebase UID

    // 💡 階層化のための追加フィールド
    parentId: { type: String, default: null, index: true }, // 親ノートのID (ルートは null)
    order: { type: Number, default: 0, index: true }, // 同一階層での表示順
  },
  { timestamps: true } // createdAt, updatedAt を自動追加
);

// スキーマから型を推論
export type INote = InferSchemaType<typeof NoteSchema>;

// 💡 クライアント側で利用する型を定義（子要素とIDを付与）
export interface NoteDocument extends Omit<INote, "_id"> {
  id: string;
  children?: NoteDocument[];
}

// モデル定義（既存モデルがあれば再利用）
const Note: Model<INote> =
  (mongoose.models.Note as Model<INote>) ||
  mongoose.model<INote>("Note", NoteSchema);

export default Note;
