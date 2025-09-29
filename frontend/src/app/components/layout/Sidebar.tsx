// frontend/src/app/components/layout/Sidebar.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import NoteList from "../notes/NoteList";
import { INote } from "../../../types";
import { useAuth } from "@/app/hooks/useAuth";
import { getNotes } from "@/services/noteService";
import { useRouter } from "next/navigation";

const Sidebar: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [notes, setNotes] = useState<INote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) return;
      try {
        const data = await getNotes(token);
        // 更新日で並べ替えて保存
        const sorted = [...data].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setNotes(sorted);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setNotes([]);
      }
    };
    if (!loading) fetchNotes();
  }, [token, loading]);

  const filteredNotes = notes.filter((note) =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (id: string) => {
    router.push(`/notes/${id}`);
    setIsPopupOpen(false);
    setSearchQuery("");
    inputRef.current?.blur();
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 h-full p-4 overflow-y-auto relative">
      <nav className="flex flex-col space-y-3">
        <Link href="/" className="hover:underline font-semibold">Home</Link>

        {/* 検索バー */}
        <div className="mt-4 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            className="w-full border rounded px-2 py-1 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsPopupOpen(true)}
            onBlur={() => setTimeout(() => setIsPopupOpen(false), 150)}
          />
          {isPopupOpen && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg rounded mt-1 z-50 max-h-64 overflow-y-auto">
              {filteredNotes.length > 0 ? (
                <NoteList notes={filteredNotes} onSelect={handleSelect} />
              ) : (
                <p className="p-2 text-gray-500">No matching notes</p>
              )}
            </div>
          )}
        </div>

        {/* 最近更新されたノート（10件だけ） */}
        <div className="mt-4">
          <h3 className="text-sm text-gray-500 mb-2">Recent Notes</h3>
          <NoteList
            notes={notes.slice(0, 10)}
            onSelect={(id) => router.push(`/notes/${id}`)}
          />
        </div>

        <Link href="/notes/create" className="hover:underline mt-4">➕ Create Note</Link>
        <Link href="/profile" className="hover:underline mt-4">Profile</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
