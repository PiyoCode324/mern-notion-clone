// backend/controllers/noteController.ts
import { Request, Response } from "express";
import Note, { INote, NoteDocument } from "../models/Note";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import mongoose, { HydratedDocument, Document } from "mongoose";

// HydratedDocumentは、Mongooseドキュメント（toObject, _idなど）の全メソッド/プロパティを含む、より正確な型
type NoteDoc = HydratedDocument<INote>;

// JSONContent 型を使う場合、型チェックだけにします
const validateContent = (content: unknown) => {
  if (typeof content !== "object" || content === null) {
    throw new Error("Invalid content format");
  }
  return content;
};

// 💡 [修正] GET /notes: ユーザーの全てのノートを階層構築のために取得
// エンドポイントは router.get("/", ...) に対応
export const getAllNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    // 💡 注意: このルートは /api/notes/all ではなく /api/notes です。
    // 💡 ID パラメータを参照するロジックはここには存在しません。

    const notes = (await Note.find({ createdBy: uid }).sort({
      order: 1,
      createdAt: 1,
    })) as NoteDoc[];

    // クライアントで扱いやすい形にIDを整形
    const clientNotes: NoteDocument[] = notes.map((note) => ({
      // .toObject()でプレーンなオブジェクトに変換
      ...note.toObject({ getters: true, virtuals: false }),
      id: note._id.toString(),
    }));

    return res.status(200).json(clientNotes);
  } catch (err) {
    console.error("Error getting all notes:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /notes
export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { title, content, markdown, tags, parentId, order } = req.body;
    const validContent = validateContent(content);

    // NoteDoc型としてアサーション
    const note = (await Note.create({
      title,
      content: validContent,
      markdown: markdown || "",
      tags: tags || [],
      createdBy: uid,
      parentId: parentId || null,
      order: order || Date.now(),
    })) as NoteDoc;

    // 作成されたノートをクライアント形式に変換して返却
    const clientNote: NoteDocument = {
      // .toObject()でプレーンなオブジェクトに変換
      ...note.toObject({ getters: true, virtuals: false }),
      id: note._id.toString(),
    };

    return res.status(201).json(clientNote);
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error)
      return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /notes/:id
export const getNoteById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    // 💡 IDのバリデーションはここで必要
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid note ID" });

    // NoteDoc型としてアサーション
    const note = (await Note.findOne({
      _id: id,
      createdBy: uid,
    })) as NoteDoc | null;
    if (!note) return res.status(404).json({ error: "Note not found" });

    // クライアント形式に変換して返却
    const clientNote: NoteDocument = {
      ...note.toObject({ getters: true, virtuals: false }),
      id: note._id.toString(),
    };

    return res.status(200).json(clientNote);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// PUT /notes/:id
export const updateNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { title, content, markdown, tags, parentId, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid note ID" });

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = validateContent(content);
    if (markdown !== undefined) updateFields.markdown = markdown;
    if (tags !== undefined) updateFields.tags = tags;
    if (parentId !== undefined) updateFields.parentId = parentId;
    if (order !== undefined) updateFields.order = order;

    // NoteDoc型としてアサーション
    const note = (await Note.findOneAndUpdate(
      { _id: id, createdBy: uid },
      updateFields,
      { new: true }
    )) as NoteDoc | null;

    if (!note) return res.status(404).json({ error: "Note not found" });

    // クライアント形式に変換して返却
    const clientNote: NoteDocument = {
      ...note.toObject({ getters: true, virtuals: false }),
      id: note._id.toString(),
    };

    return res.status(200).json(clientNote);
  } catch (err: unknown) {
    console.error("Update note error:", {
      error: err instanceof Error ? err.message : String(err),
      body: req.body,
      params: req.params,
    });
    if (err instanceof Error)
      return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE /notes/:id
export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid note ID" });

    // NoteDoc型としてアサーション
    const note = (await Note.findOneAndDelete({
      _id: id,
      createdBy: uid,
    })) as NoteDoc | null;
    if (!note) return res.status(404).json({ error: "Note not found" });

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
