// frontend/src/app/notes/[noteId]/page.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import NoteDetail from "../../components/notes/NoteDetail";

export default function NoteDetailPage() {
  const { noteId } = useParams() as { noteId: string };

  return <NoteDetail noteId={noteId} />;
}
