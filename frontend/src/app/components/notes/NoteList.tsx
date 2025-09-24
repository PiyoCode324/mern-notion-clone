// frontend/src/app/components/notes/NoteList.tsx
import React from "react";
import Link from "next/link";
import { INote } from "../../../types";

interface NoteListProps {
  notes: INote[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  if (notes.length === 0) return <p>No notes yet.</p>;

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <Link
          key={note._id}
          href={`/notes/${note._id}`}
          className="block p-2 rounded hover:bg-gray-200"
        >
          <p className="truncate font-medium">{note.title || "Untitled"}</p>
          <span className="text-xs text-gray-500">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default NoteList;
