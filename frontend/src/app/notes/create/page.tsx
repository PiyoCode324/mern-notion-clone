// frontend/src/app/notes/create/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react"; // 💡 useRef をインポート
import { useAuthContext } from "../../hooks/useAuthContext";
import { createNote } from "@/services/noteService";
import NoteDetail from "../../components/notes/NoteDetail";
import { NoteDocument } from "../../../types";
import { useSearchParams, useRouter } from "next/navigation";
import { useNotesData } from "@/app/hooks/useNotesData";

export default function CreateNotePage() {
  const { user, token, loading } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshNotes, updateNoteLocally } = useNotesData();

  const [noteDocument, setNoteDocument] = useState<NoteDocument | null>(null);
  const [initializing, setInitializing] = useState(true); // 💡 useState から useRef に変更し、初期作成フラグを管理します
  const hasCreatedNoteRef = useRef(false);

  const parentId = searchParams.get("parentId");
  const [title, setTitle] = useState("Untitled Note");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    // 💡 useRef の値を使って、既にノート作成処理が実行済みかチェックします
    if (!user || !token || hasCreatedNoteRef.current) return;

    const createInitialNote = async () => {
      setInitializing(true);
      hasCreatedNoteRef.current = true; // 💡 処理開始前にフラグを true に設定

      try {
        const payload = {
          title: "Untitled Note",
          parentId: parentId || null,
          order: 0,
          content: { type: "doc", content: [] },
        };
        console.log("[CreateNotePage] Creating note:", payload);
        const created = await createNote(payload, token); // 楽観的更新
        updateNoteLocally(created.id, {
          ...created,
          id: created.id,
          title: created.title || "Untitled Note",
          tags: created.tags || [],
          content: created.content || { type: "doc", content: [] },
          updatedAt: created.updatedAt,
        });
        await refreshNotes();
        router.replace(`/notes/${created.id}`);
        setNoteDocument(created);
        setTitle(created.title || "Untitled Note");
        setTags(created.tags || []);
        console.log("[CreateNotePage] Note created successfully:", created.id);
      } catch (err) {
        console.error("[CreateNotePage] Error creating note:", err);
        hasCreatedNoteRef.current = false; // 💡 エラー時はフラグを戻す
      } finally {
        setInitializing(false);
      }
    };

    createInitialNote();
  }, [
    user,
    token,
    parentId, // 💡 hasCreatedNote の依存配列を削除
    router,
    refreshNotes,
    updateNoteLocally,
  ]);

  if (loading || initializing || !noteDocument)
    return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create Note</h1>
           {" "}
      <NoteDetail
        noteId={noteDocument.id}
        editable={true}
        title={title}
        setTitle={setTitle}
        tags={tags}
        setTags={setTags}
        isCreateMode={true}
      />
         {" "}
    </div>
  );
}
