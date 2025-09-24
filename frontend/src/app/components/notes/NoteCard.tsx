// frontend/src/app/components/notes/NoteCard.tsx
import React from "react";
import Link from "next/link";

interface NoteCardProps {
  _id: string; // 詳細ページ用にID
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const NoteCard: React.FC<NoteCardProps> = ({
  _id,
  title,
  content,
  tags,
  createdAt,
}) => {
  return (
    <Link href={`/notes/${_id}`} className="block">
      <div className="border border-transparent hover:border-gray-300 transition-all rounded-lg p-5 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md cursor-pointer">
        {/* タイトル */}
        <h2 className="font-semibold text-lg mb-2">{title}</h2>

        {/* コンテンツ */}
        <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
          {content}
        </p>

        {/* タグ */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 px-2 py-0.5 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 作成日時 */}
        <p className="text-gray-400 text-xs mt-3">
          {new Date(createdAt).toLocaleString()}
        </p>
      </div>
    </Link>
  );
};

export default NoteCard;
