// backend/controllers/noteController.ts
import { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose";

// JSONContent 型を使う場合、型チェックだけにします
const validateContent = (content: unknown) => {
  if (typeof content !== "object" || content === null) {
    throw new Error("Invalid content format");
  }
  return content;
};

// GET /notes
export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const notes: INote[] = await Note.find({ createdBy: uid }).sort({
      updatedAt: -1,
    });
    return res.status(200).json(notes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /notes
export const createNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { title, content, markdown, tags } = req.body;
    const validContent = validateContent(content);

    const note: INote = await Note.create({
      title,
      content: validContent,
      markdown: markdown || "",
      tags,
      createdBy: uid,
    });

    return res.status(201).json(note);
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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid note ID" });

    const note = await Note.findOne({ _id: id, createdBy: uid });
    if (!note) return res.status(404).json({ error: "Note not found" });

    return res.status(200).json(note);
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
    const { title, content, markdown, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid note ID" });

    const validContent = validateContent(content);

    const note = await Note.findOneAndUpdate(
      { _id: id, createdBy: uid },
      { title, content: validContent, markdown: markdown || "", tags },
      { new: true }
    );

    if (!note) return res.status(404).json({ error: "Note not found" });
    return res.status(200).json(note);
  } catch (err: unknown) {
    console.error(err);
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

    const note = await Note.findOneAndDelete({ _id: id, createdBy: uid });
    if (!note) return res.status(404).json({ error: "Note not found" });

    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
