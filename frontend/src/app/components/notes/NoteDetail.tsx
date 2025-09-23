// frontend/src/app/components/notes/NoteDetail.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { INote } from "../../../types";
import { getNotes, deleteNote } from "@/services/noteService";
import NoteForm from "./NoteForm";
import { getNoteById } from "@/services/noteService";

export default function NoteDetail() {
  const { noteId } = useParams() as { noteId: string };
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [note, setNote] = useState<INote | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    const fetchNote = async () => {
      try {
        const found = await getNoteById(noteId, token); // ← 新しい関数を呼ぶ
        setNote(found);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch note");
      } finally {
        setLoadingNote(false);
      }
    };

    fetchNote();
  }, [user, token, noteId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      if (!note) return;
      await deleteNote(note._id, token!);
      router.push("/notes");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to delete note");
    }
  };

  if (loading || loadingNote) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!note) return <p className="p-4">Note not found.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {editing ? (
        <NoteForm
          note={note}
          token={token}
          onCancel={() => setEditing(false)}
          onSaved={(updatedNote) => {
            setNote(updatedNote);
            setEditing(false);
          }}
        />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
          <div className="text-sm text-gray-500 mb-4">
            Created: {new Date(note.createdAt).toLocaleString()} | Updated:{" "}
            {new Date(note.updatedAt).toLocaleString()}
          </div>
          <div className="mb-4 whitespace-pre-wrap">{note.content}</div>
          <div className="mb-4">
            {note.tags.map((t) => (
              <span
                key={t}
                className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
