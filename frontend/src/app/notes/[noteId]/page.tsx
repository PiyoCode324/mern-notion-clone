// frontend/src/app/notes/[noteId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteDetail from "../../components/notes/NoteDetail";
import { INote } from "../../../types";
import { getNotes } from "@/services/noteService";
import { useAuth } from "@/app/hooks/useAuth";

export default function NoteDetailPage() {
  const { noteId } = useParams() as { noteId: string };
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [notes, setNotes] = useState<INote[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    const fetchAllNotes = async () => {
      try {
        const data = await getNotes(token);
        setNotes(data);
        setFetchError(null);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) setFetchError(err.message);
        else setFetchError("Failed to fetch notes.");
        setNotes([]);
      }
    };

    fetchAllNotes();
  }, [user, token]);

  const handleDelete = (deletedNoteId: string) => {
    const remainingNotes = notes.filter((n) => n._id !== deletedNoteId);

    if (remainingNotes.length > 0) {
      // 更新日時が最新のノートを選択
      const nextNote = remainingNotes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      router.push(`/notes/${nextNote._id}`);
    } else {
      router.push(`/notes`); // ノートが0個ならホームページへ
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;
  if (fetchError) return <p className="p-4 text-red-500">{fetchError}</p>;

  return (
    <NoteDetail
      noteId={noteId}
      notes={notes} // NoteDetail に残りノート情報を渡す
      onDelete={() => handleDelete(noteId)}
    />
  );
}
