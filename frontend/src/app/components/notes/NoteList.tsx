// frontend/src/app/components/notes/NoteList.tsx
import React from "react";
// 💡 [修正] INoteではなく、NoteDocumentをインポート
import { NoteDocument } from "@/types";

interface NoteListProps {
  // 💡 [修正] notesの型を NoteDocument[] に変更
  notes: NoteDocument[];
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
          // 💡 [修正] keyとonSelectの引数を note.id に変更（NoteDocumentは id を使用）
          key={note.id}
          onClick={() => onSelect?.(note.id)}
          className={`cursor-pointer p-2 rounded ${
            selectedNoteId === note.id
              ? "bg-blue-200 dark:bg-blue-700"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          } dark:text-white`}
        >
          <p className="truncate font-medium">{note.title || "Untitled"}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
