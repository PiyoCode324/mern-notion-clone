// frontend/src/app/components/notes/NoteList.tsx
import React from "react";
import { INote } from "../../../types";

interface NoteListProps {
  notes: INote[];
  onSelect?: (id: string) => void;
  selectedNoteId?: string | null;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  onSelect,
  selectedNoteId,
}) => {
  if (notes.length === 0) return <p>No notes yet.</p>;

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note._id}
          onClick={() => onSelect?.(note._id)}
          className={`cursor-pointer p-2 rounded ${
            selectedNoteId === note._id ? "bg-blue-200" : "hover:bg-gray-200"
          }`}
        >
          <p className="truncate font-medium">{note.title || "Untitled"}</p>
          <span className="text-xs text-gray-500">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
