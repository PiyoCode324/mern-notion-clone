// frontend/src/app/notes/[noteId]/page.tsx
"use client"; // NoteDetail uses useParams/useAuth which are client hooks
import React from "react";
import NoteDetail from "../../components/notes/NoteDetail"; // 相対パスに注意

export default function NoteDetailPage() {
  return <NoteDetail />;
}
