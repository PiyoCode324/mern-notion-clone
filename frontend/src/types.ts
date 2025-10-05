// frontend/src/types.ts
import { JSONContent } from "@tiptap/react";

// Mongooseのドキュメントが持つ基本フィールドを定義
export interface INote {
  // Mongooseの _id を持つ（バックエンドからの応答用）
  _id: string;
  title: string;
  content: JSONContent;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  markdown: string;

  // 💡 [追加] 階層構造と並び順のためのフィールド
  parentId: string | null; // 親ノートのID。ルートは null
  order: number; // 同一階層内での表示順
}

// 💡 [追加] クライアント側（Sidebar, NoteDetail）で主に利用する型
// _idの代わりに id を使用し、ツリー構造のための children を含む
export interface NoteDocument {
  id: string; // クライアント側で利用する文字列ID
  title: string;
  content: JSONContent;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  markdown: string;

  parentId: string | null;
  order: number;

  // 💡 再帰的なツリー構築のために必要
  children?: NoteDocument[];
}
