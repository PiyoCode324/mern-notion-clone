// frontend/src/app/notes/NoteTreeItem.tsx
"use client";

import React, { useState } from "react";
import { NoteDocument } from "@/types";
import useNoteSelection from "@/app/hooks/useNoteSelection";
import Link from "next/link";
import { ChevronDown, ChevronRight, FileText, Plus } from "lucide-react";

interface Props {
  note: NoteDocument;
  onSelect: (id: string) => void;
  level: number;
}

const NoteTreeItem: React.FC<Props> = ({ note, onSelect, level }) => {
  const { selectedNoteId } = useNoteSelection();
  const [isExpanded, setIsExpanded] = useState(true);

  const isSelected = selectedNoteId === note.id;
  const hasChildren = note.children && note.children.length > 0;

  const paddingLeft = `calc(10px + ${level * 16}px)`;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <li className="list-none w-full relative">
      <div className="flex items-center justify-between w-full">
        <Link
          href={`/notes/${note.id}`}
          onClick={() => onSelect(note.id)}
          className={`
            flex items-center space-x-2 py-1 pr-2 rounded transition-colors duration-150 text-sm
            hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left
            ${
              isSelected
                ? "bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-white font-semibold"
                : "text-gray-700 dark:text-gray-300"
            }
          `}
          style={{ paddingLeft }}
          tabIndex={0}
        >
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className="p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <div className="flex justify-center" style={{ width: "20px" }}>
              <FileText
                size={14}
                className="text-gray-500 dark:text-gray-400"
              />
            </div>
          )}
          <span className="truncate flex-grow">{note.title || "Untitled"}</span>
        </Link>

        <Link
          href={`/notes/create?parentId=${note.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="Add child note"
        >
          <Plus size={14} className="text-gray-500 dark:text-gray-400" />
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group" className="space-y-0.5">
          {note.children!.map((childNote) => (
            <NoteTreeItem
              key={childNote.id}
              note={childNote}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default NoteTreeItem;
