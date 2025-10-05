// frontend/src/app/notes/NoteTreeItem.tsx
"use client";

import React, { useState } from "react";
import { NoteDocument } from "@/types";
import useNoteSelection from "@/app/hooks/useNoteSelection";
import Link from "next/link";
// 💡 アイコンをインポート（フォルダのような表現を簡略化）
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

interface Props {
  note: NoteDocument;
  // onSelect はナビゲーション後に Sidebar が処理を引き継ぐために残します
  onSelect: (id: string) => void;
  // 💡 ネストレベルを受け取る
  level: number;
}

/**
 * 💡 階層構造（ツリー）の単一のノート項目をレンダリングする再帰コンポーネント。
 */
const NoteTreeItem: React.FC<Props> = ({ note, onSelect, level }) => {
  // グローバルな選択状態を取得
  const { selectedNoteId } = useNoteSelection();

  // 💡 [修正点 1] 展開/折りたたみ状態を管理
  const [isExpanded, setIsExpanded] = useState(true);

  const isSelected = selectedNoteId === note.id;
  const hasChildren = note.children && note.children.length > 0;

  // ネストレベルに応じたパディングを計算
  // 最初のベースパディング (10px) + ネストごとの追加パディング (16px)
  const paddingLeft = `calc(10px + ${level * 16}px)`;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Linkのナビゲーションを防ぐ
    e.stopPropagation(); // 親要素のクリックイベント（選択）を防ぐ
    setIsExpanded((prev) => !prev);
  };

  // 💡 [修正点 2] Linkコンポーネントを使用してナビゲーション
  return (
    <li className="list-none w-full">
      {/* Linkでルーティングを処理 */}
      <Link
        href={`/notes/${note.id}`}
        onClick={() => onSelect(note.id)} // 選択状態を更新
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
        {/* 展開・折りたたみトグル */}
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
            <FileText size={14} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}

        {/* タイトル */}
        <span className="truncate flex-grow">{note.title || "Untitled"}</span>
      </Link>

      {/* 💡 [修正点 1] 子ノートのリスト：展開されている場合のみ表示 */}
      {hasChildren && isExpanded && (
        <ul role="group" className="space-y-0.5">
          {note.children!.map((childNote) => (
            // 自身 (NoteTreeItem) を再帰的に呼び出す
            <NoteTreeItem
              key={childNote.id}
              note={childNote}
              onSelect={onSelect}
              level={level + 1} // 💡 ネストレベルをインクリメント
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default NoteTreeItem;
