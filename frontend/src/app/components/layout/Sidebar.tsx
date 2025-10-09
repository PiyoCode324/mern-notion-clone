// frontend/src/app/components/layout/Sidebar.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import NoteList from "../notes/NoteList";
import { useRouter } from "next/navigation";
import NoteTreeItem from "@/app/notes/NoteTreeItem";
import useNoteSelection from "@/app/hooks/useNoteSelection";
import { useNotesData } from "@/app/hooks/useNotesData";

const Sidebar: React.FC = () => {
  const { noteTree, flatNotes, loadingNotes: loading, refreshStatus } = useNotesData();
  const { setSelectedNoteId } = useNoteSelection();

  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredNotes = flatNotes.filter((note) =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = useCallback(
    (id: string) => {
      console.log("[Sidebar] Note selected:", id);
      setSelectedNoteId(id);
      router.push(`/notes/${id}`);
      setIsPopupOpen(false);
      setSearchQuery("");
      inputRef.current?.blur();
    },
    [router, setSelectedNoteId]
  );

  useEffect(() => {
    if (refreshStatus === "completed") {
      console.log("[Sidebar] Notes refreshed successfully");
    }
  }, [refreshStatus]);

  const renderSearchPopup = () => {
    if (!isPopupOpen || searchQuery.trim() === "") return null;
    return (
      <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg rounded mt-1 z-50 max-h-64 overflow-y-auto">
        {filteredNotes.length > 0 ? (
          <NoteList notes={filteredNotes} onSelect={handleSelect} />
        ) : (
          <p className="p-2 text-gray-500">No matching notes</p>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 h-full p-4 overflow-y-auto relative">
      <nav className="flex flex-col space-y-3">
        <Link href="/" className="hover:underline font-semibold">
          Home
        </Link>

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
            spellCheck={false}
          />
          {renderSearchPopup()}
        </div>

        <div className="mt-4">
          <h3 className="text-sm text-gray-500 mb-2">My Pages</h3>
          <ul className="space-y-1">
            {loading || refreshStatus === "refreshing" ? (
              <p className="text-sm text-gray-400">Loading notes...</p>
            ) : (
              noteTree.map((rootNote) => (
                <NoteTreeItem
                  key={rootNote.id}
                  note={rootNote as any}
                  onSelect={handleSelect}
                  level={0}
                />
              ))
            )}
            {!loading && refreshStatus !== "refreshing" && noteTree.length === 0 && (
              <p className="text-sm text-gray-400">ノートを作成しましょう。</p>
            )}
          </ul>
        </div>

        <Link href="/notes/create" className="hover:underline mt-4">
          ➕ Create Note
        </Link>
        <Link href="/profile" className="hover:underline mt-4">
          Profile
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;