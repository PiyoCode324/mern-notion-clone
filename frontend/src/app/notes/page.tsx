// frontend/src/app/notes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { INote } from "../../types";
import NoteList from "../components/notes/NoteList";
import { getNotes } from "@/services/noteService";

export default function NotesPage() {
  const { user, token, loading } = useAuth(); // tokenとloadingをuseAuthから取得
  const [notes, setNotes] = useState<INote[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllNotes = async () => {
      // ユーザーまたはトークンがなければ処理を中断
      if (!user || !token) {
        return;
      }

      try {
        const data = await getNotes(token); // ここで最新のトークンを渡す
        setNotes(data);
        setFetchError(null);
      } catch (err: unknown) {
        console.error("Error fetching notes:", err);
        if (err instanceof Error) {
          setFetchError(err.message);
        } else {
          setFetchError("Failed to fetch notes.");
        }
        setNotes([]); // エラー時はノートリストをクリア
      }
    };

    if (!loading) {
      // ローディングが完了してからフェッチ開始
      fetchAllNotes();
    }
  }, [user, token, loading]);

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  // userやtokenがない場合は、useAuthがリダイレクトを処理しているためnullを返す
  if (!user || !token) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Notes</h1>
      {fetchError && <p className="text-red-500 mb-4">Error: {fetchError}</p>}
      <NoteList notes={notes} />
    </div>
  );
}
