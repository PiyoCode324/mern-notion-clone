// frontend/src/app/notes/[noteId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteDetail from "../../components/notes/NoteDetail";
import { NoteDocument } from "../../../types";
import { getNotes } from "@/services/noteService";
import { useAuthContext } from "@/app/hooks/useAuthContext";

export default function NoteDetailPage() {
  const { noteId } = useParams() as { noteId: string };
  const router = useRouter();
  const { user, token, loading } = useAuthContext();

  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    const fetchAllNotes = async () => {
      try {
        const data: NoteDocument[] = await getNotes(token);
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
    const remainingNotes = notes.filter((n) => n.id !== deletedNoteId);

    if (remainingNotes.length > 0) {
      const nextNote = remainingNotes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      router.push(`/notes/${nextNote.id}`);
    } else {
      router.push(`/notes`);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;
  if (fetchError) return <p className="p-4 text-red-500">{fetchError}</p>;

  return (
    <NoteDetail
      noteId={noteId}
      isCreateMode={false}
      notes={notes}
      onDelete={() => handleDelete(noteId)}
    />
  );
}
