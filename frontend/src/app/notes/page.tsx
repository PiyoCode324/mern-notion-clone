// frontend/src/app/notes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { INote } from "../../types";
import NoteList from "../components/notes/NoteList";
import NoteDetail from "../components/notes/NoteDetail";
import { getNotes } from "@/services/noteService";

export default function NotesPage() {
  const { user, token, loading } = useAuth();
  const [notes, setNotes] = useState<INote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    const fetchAllNotes = async () => {
      try {
        const data = await getNotes(token);
        setNotes(data);
        setFetchError(null);
        // 最初のノートを自動選択
        if (data.length > 0) setSelectedNoteId(data[0]._id);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) setFetchError(err.message);
        else setFetchError("Failed to fetch notes.");
        setNotes([]);
      }
    };

    fetchAllNotes();
  }, [user, token]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;

  return (
    <div className="flex h-screen">
      {/* メインコンテンツ */}
      <main className="flex-1 p-6 overflow-y-auto">
        {selectedNoteId ? (
          <NoteDetail
            noteId={selectedNoteId}
            onDelete={() => {
              setNotes((prev) => prev.filter((n) => n._id !== selectedNoteId));
              setSelectedNoteId(null);
            }}
          />
        ) : (
          <p className="text-gray-500">Select a note to view/edit</p>
        )}
      </main>
    </div>
  );
}
