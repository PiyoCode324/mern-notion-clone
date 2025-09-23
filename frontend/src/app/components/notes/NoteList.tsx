// frontend/src/app/components/notes/NoteList.tsx
import React from "react";
import NoteCard from "./NoteCard";
import { INote } from "../../../types";

interface NoteListProps {
  notes: INote[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  if (notes.length === 0) return <p>No notes yet.</p>;

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          _id={note._id}              // 追加：詳細ページ用
          title={note.title}
          content={note.content}
          tags={note.tags}
          createdAt={note.createdAt}
        />
      ))}
    </div>
  );
};

export default NoteList;
