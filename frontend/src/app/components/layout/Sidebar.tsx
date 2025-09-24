// frontend/src/app/components/layout/Sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import NoteList from "../notes/NoteList";
import { INote } from "../../../types";
import { useAuth } from "@/app/hooks/useAuth";
import { getNotes } from "@/services/noteService";

const Sidebar: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [notes, setNotes] = useState<INote[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return;
      try {
        const data = await getNotes(token);
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setNotes([]);
      }
    };

    if (!loading) fetchNotes();
  }, [token, loading]);

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 h-full p-4 overflow-y-auto">
      <nav className="flex flex-col space-y-3">
        {/* トップページ */}
        <Link href="/" className="hover:underline font-semibold">
          Home
        </Link>

        {/* ノート一覧（Notion風） */}
        <div className="mt-4">
          <h3 className="text-sm text-gray-500 mb-2">Notes</h3>
          <NoteList notes={notes} />
        </div>

        {/* ノート作成 */}
        <Link href="/notes/create" className="hover:underline mt-4">
          ➕ Create Note
        </Link>

        {/* プロフィール */}
        <Link href="/profile" className="hover:underline mt-4">
          Profile
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
