// frontend/src/app/components/layout/Sidebar.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import NoteList from "../notes/NoteList";
import { useRouter } from "next/navigation";
import NoteTreeItem from "@/app/notes/NoteTreeItem";
import useNoteSelection from "@/app/hooks/useNoteSelection";
import { useNotesData } from "@/app/hooks/useNotesData";
import { Search } from "lucide-react";

interface SidebarProps {
  onSelect?: () => void; // ✅ Layoutから受け取るprops（モバイル時に閉じる用）
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  const {
    noteTree,
    flatNotes,
    loadingNotes: loading,
    refreshStatus,
  } = useNotesData();
  const { setSelectedNoteId } = useNoteSelection();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ 検索フィルタ
  const filteredNotes = flatNotes.filter((note) =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ ノート選択時の動作
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedNoteId(id);
      router.push(`/notes/${id}`);
      setIsPopupOpen(false);
      setSearchQuery("");
      inputRef.current?.blur();
      onSelect?.(); // ← モバイル時のみSidebarを閉じる
    },
    [router, setSelectedNoteId, onSelect]
  );

  useEffect(() => {
    if (refreshStatus === "completed") {
      console.log("[Sidebar] Notes refreshed successfully");
    }
  }, [refreshStatus]);

  // ✅ 検索ポップアップ表示
  const renderSearchPopup = () => {
    if (!isPopupOpen || searchQuery.trim() === "") return null;
    return (
      <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md mt-1 z-50 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700">
        {filteredNotes.length > 0 ? (
          <NoteList notes={filteredNotes} onSelect={handleSelect} />
        ) : (
          <p className="p-2 text-gray-500 text-sm">No matching notes</p>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1f1f1f] p-4 overflow-y-auto flex flex-col h-full">
      <nav className="flex flex-col space-y-3">
        {/* Home リンク */}
        <Link
          href="/"
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 font-medium"
          onClick={onSelect}
        >
          🏠 Home
        </Link>

        {/* 🔍 Search */}
        <div className="relative mt-2">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 px-2">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className="w-full py-1 text-sm bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsPopupOpen(true)}
              onBlur={() => setTimeout(() => setIsPopupOpen(false), 150)}
              spellCheck={false}
            />
          </div>
          {renderSearchPopup()}
        </div>

        {/* 📄 Notes Section */}
        <div className="mt-5">
          <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            My Pages
          </h3>
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
            {!loading &&
              refreshStatus !== "refreshing" &&
              noteTree.length === 0 && (
                <p className="text-sm text-gray-400">
                  ノートを作成しましょう。
                </p>
              )}
          </ul>
        </div>

        {/* ➕ その他リンク */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-3 space-y-2">
          <Link
            href="/notes/create"
            className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            onClick={onSelect}
          >
            ➕ Create Note
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
