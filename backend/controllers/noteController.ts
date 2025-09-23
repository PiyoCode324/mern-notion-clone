// backend/controllers/noteController.ts
import { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import mongoose from "mongoose"; // mongoose をインポートに追加

// GET /notes
export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const notes: INote[] = await Note.find({ createdBy: uid });
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

    const { title, content, tags } = req.body;
    const note: INote = await Note.create({
      title,
      content,
      tags,
      createdBy: uid,
    });
    return res.status(201).json(note);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /notes/:id
export const getNoteById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

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
    const { title, content, tags } = req.body;

    // Add a check to ensure ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, createdBy: uid },
      { title, content, tags },
      { new: true }
    );

    if (!note) return res.status(404).json({ error: "Note not found" });
    return res.status(200).json(note);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE /notes/:id
export const deleteNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Add a check to ensure ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note ID" });
    }

    const note = await Note.findOneAndDelete({ _id: id, createdBy: uid });

    if (!note) return res.status(404).json({ error: "Note not found" });
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
