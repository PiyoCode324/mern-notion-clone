// frontend/src/app/notes/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createNote } from "@/services/noteService";
import NoteDetail from "../../components/notes/NoteDetail";

export default function CreateNotePage() {
  const { user, token, loading } = useAuth();

  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [initializing, setInitializing] = useState(true); // 初期作成中かどうか

  // 初回ロード時に空のノートを作成して ID を取得
  useEffect(() => {
    if (!user || !token || newNoteId) return;

    const createInitialNote = async () => {
      try {
        const payload = {
          title: "Untitled Note",
          tags: [],
          content: { type: "doc", content: [] },
          markdown: "",
        };
        const created = await createNote(payload, token);
        setNewNoteId(created._id);
        setInitializing(false);
      } catch (err) {
        console.error(err);
      }
    };

    createInitialNote();
  }, [user, token, newNoteId]);

  if (loading || initializing) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Note</h1>

      {/* NoteDetail に編集・自動保存をすべて任せる */}
      <NoteDetail
        noteId={newNoteId} // 初期作成済みのIDを渡す
        editable={true}
        title={title}
        setTitle={setTitle}
        tags={tags}
        setTags={setTags}
      />
    </div>
  );
}
