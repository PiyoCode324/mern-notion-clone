// frontend/src/app/components/notes/NoteForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INote } from "../../../types";
import { createNote, updateNote } from "@/services/noteService";

interface NoteFormProps {
  note?: INote;
  token: string;
  onCancel?: () => void;
  onSaved?: (note: INote) => void;
}

export default function NoteForm({ note, token, onCancel, onSaved }: NoteFormProps) {
  const isEdit = !!note;
  const router = useRouter();

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [tags, setTags] = useState(note?.tags.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const noteData = {
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      let savedNote: INote;
      if (isEdit && note) {
        savedNote = await updateNote(note._id, noteData, token);
      } else {
        savedNote = await createNote(noteData, token);
      }

      if (onSaved) {
        onSaved(savedNote);
      } else {
        router.push("/notes");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={6}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Tags (comma separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
