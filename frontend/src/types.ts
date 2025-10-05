// frontend/src/types.ts
import { JSONContent } from "@tiptap/react";

/**
 * 💡 バックエンド（MongoDB/Mongoose）用の型
 * _id が必須で返却される
 */
export interface INote {
  _id: string; // Mongoose の ID
  title: string;
  content: JSONContent;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  markdown: string;

  parentId: string | null; // 親ノートのID。ルートは null
  order: number; // 同一階層内での表示順
}

/**
 * 💡 クライアント側で扱いやすい型
 * _id を id に置き換え、children を含む
 */
export interface NoteDocument {
  id: string; // フロント用の文字列ID
  title: string;
  content: JSONContent;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  markdown: string;

  parentId: string | null;
  order: number;

  children?: NoteDocument[];
}

/**
 * 💡 バックエンドから取得した INote[] をフロント用 NoteDocument[] に変換するヘルパー関数
 * これを使うと型エラーを回避できます
 */
export const mapNotesToDocuments = (notes: INote[]): NoteDocument[] => {
  return notes.map((note) => ({
    id: note._id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    markdown: note.markdown,
    parentId: note.parentId,
    order: note.order,
    children: [], // 初期値は空配列。Sidebar でツリーを構築する際に再帰的に埋めます
  }));
};
