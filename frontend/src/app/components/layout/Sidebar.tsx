// frontend/src/app/components/layout/Sidebar.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import NoteList from "../notes/NoteList";
import { NoteDocument } from "@/types";
import { useAuth } from "@/app/hooks/useAuth";
import { getAllNotes } from "@/services/noteService";
import { useRouter } from "next/navigation";
import NoteTreeItem from "@/app/notes/NoteTreeItem";
import useNoteSelection from "@/app/hooks/useNoteSelection";

// フラットなノートリストをツリー構造に変換するヘルパー関数
const buildTree = (
  notes: NoteDocument[],
  parentId: string | null = null
): NoteDocument[] => {
  return (
    notes
      .filter((note) => (note.parentId || null) === parentId)
      .map((note) => ({
        ...note,
        children: buildTree(notes, note.id),
      }))
      .sort((a, b) => a.order - b.order)
  );
};

const Sidebar: React.FC = () => {
  const { token, loading } = useAuth();
  const [flatNotes, setFlatNotes] = useState<NoteDocument[]>([]);
  const [noteTree, setNoteTree] = useState<NoteDocument[]>([]);
  const { setSelectedNoteId } = useNoteSelection();

  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAndBuildTree = async () => {
      if (!token) return;
      try {
        const data: NoteDocument[] = await getAllNotes(token);
        setFlatNotes(data);
        const tree = buildTree(data, null);
        setNoteTree(tree);
      } catch (error) {
        console.error("[Sidebar] Failed to fetch notes:", error);
        setFlatNotes([]);
        setNoteTree([]);
      }
    };
    if (!loading) fetchAndBuildTree();
  }, [token, loading]);

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
            spellCheck={false}
          />
          {renderSearchPopup()}
        </div>

        {/* 階層化されたノートリスト */}
        <div className="mt-4">
          <h3 className="text-sm text-gray-500 mb-2">My Pages</h3>
          <ul className="space-y-1">
            {noteTree.map((rootNote) => (
              <NoteTreeItem
                key={rootNote.id}
                note={rootNote}
                onSelect={handleSelect}
                level={0}
              />
            ))}
            {noteTree.length === 0 && !loading && (
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
