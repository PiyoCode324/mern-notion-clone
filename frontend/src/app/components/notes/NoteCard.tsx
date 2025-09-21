// frontend/src/components/notes/NoteCard.tsx
import React from "react";

interface NoteCardProps {
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const NoteCard: React.FC<NoteCardProps> = ({
  title,
  content,
  tags,
  createdAt,
}) => {
  return (
    <div className="border p-4 rounded shadow bg-white dark:bg-gray-800">
      <h2 className="font-bold text-lg">{title}</h2>
      <p className="text-gray-700 dark:text-gray-300 mt-2">{content}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-gray-400 text-sm mt-2">
        {new Date(createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default NoteCard;
