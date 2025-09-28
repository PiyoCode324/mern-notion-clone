// frontend/src/app/components/notes/NoteDetail.tsx
"use client";

import React, { useEffect, useState, useRef } from "react"; // 🚨 useRefを含めたReactフックのimport
import { useAuth } from "../../hooks/useAuth"; // 認証情報（ユーザー、トークン、ロード状態）を取得するカスタムフック
import { INote } from "../../../types"; // ノートの型定義
import { deleteNote, getNoteById, updateNote } from "@/services/noteService"; // ノート関連のAPIサービス
import TiptapEditor from "./TiptapEditor"; // Tiptapエディタコンポーネント
import { defaultMarkdownSerializer } from "prosemirror-markdown"; // ProseMirrorのMarkdown変換機能
import { JSONContent } from "@tiptap/core"; // TiptapのJSON形式コンテンツ型
import { Node } from "prosemirror-model"; // ProseMirrorのNode型

// コンポーネントに渡されるpropsの型定義
interface NoteDetailProps {
  noteId: string | null; // 表示するノートのID（nullの場合は何も表示しない）
  onDelete?: () => void; // 削除後のコールバック（親コンポーネントで処理）
}

// デバウンス処理を行う関数（指定時間待ってから実行する仕組み）
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout; // タイマーIDを格納する変数
  return (...args: any) => {
    clearTimeout(timeoutId); // 直前のタイマーをクリア
    timeoutId = setTimeout(() => func(...args), delay); // delay後にfuncを実行
  };
};

const NoteDetail: React.FC<NoteDetailProps> = ({ noteId, onDelete }) => {
  const { user, token, loading } = useAuth(); // 現在のユーザー、認証トークン、ロード中状態
  const [note, setNote] = useState<INote | null>(null); // 表示するノートデータ
  const [loadingNote, setLoadingNote] = useState(true); // ノート読み込み中フラグ
  const [error, setError] = useState(""); // エラーメッセージ格納用
  // const [editing, setEditing] = useState(false); // 🚨 編集モード切替は削除済み

  // エディタの現在の内容を保持するステート
  const [editorContent, setEditorContent] = useState<JSONContent | undefined>(
    undefined
  );
  // 初回ロード判定用（初回ロードでは自動保存を発火させないために利用）
  const initialLoadRef = useRef(true);

  // ノートのデータを取得してstateに格納する処理
  useEffect(() => {
    if (!user || !token || !noteId) return; // ユーザー未ログインやID未指定の場合は処理しない

    const fetchNote = async () => {
      setLoadingNote(true);
      try {
        const found = await getNoteById(noteId, token); // APIからノートを取得
        setNote(found); // ノートをstateに設定
        setEditorContent(found.content || { type: "doc", content: [] }); // エディタ用のコンテンツも設定
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch note");
      } finally {
        setLoadingNote(false);
      }
    };

    fetchNote();
  }, [user, token, noteId]); // 認証情報やノートIDが変わったら再実行

  // 🚨 自動保存処理（デバウンス付き）
  const autoSave = useRef(
    debounce(async (content: JSONContent) => {
      if (!note || !token) return;

      try {
        // JSON形式のcontentをProseMirrorのNodeに変換し、Markdownにシリアライズ
        const docNode = content as unknown as Node;
        const markdown = defaultMarkdownSerializer.serialize(docNode);

        // ノートを更新（contentとmarkdownの両方を保存）
        const updatedNote = await updateNote(
          note._id,
          { content, markdown },
          token
        );
        // setNote(updatedNote);
        // → Note全体を更新すると再レンダリングが過剰になるのでコメントアウト
        console.log("Note saved automatically.");
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save note automatically"
        );
      }
    }, 1000) // 1秒間操作がなければ保存
  ).current;

  // editorContentが変更されたときに自動保存を発火
  useEffect(() => {
    if (initialLoadRef.current) {
      // 初回ロードでは自動保存をスキップ
      initialLoadRef.current = false;
      return;
    }

    // ノートとコンテンツが揃っていれば自動保存
    if (editorContent && note) {
      autoSave(editorContent);
    }
  }, [editorContent, note]);

  // ノート削除処理
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return; // 確認ダイアログ
    try {
      if (!note) return;
      await deleteNote(note._id, token!); // API経由で削除
      if (onDelete) onDelete(); // 親コンポーネントに通知
      setNote(null); // 自身のstateからノートを消す
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  // エディタ内容が変更されたときに呼ばれるハンドラ
  const handleContentChange = (content: JSONContent) => {
    setEditorContent(content);
  };

  // 各種状態に応じたレンダリング
  if (loading || loadingNote) return <p className="p-4">Loading...</p>; // 認証またはノート取得中
  if (!user || !token) return null; // ユーザー未ログインなら何も表示しない
  if (error) return <p className="p-4 text-red-500">{error}</p>; // エラー発生時
  if (!note || !editorContent)
    return <p className="p-4">Note not found or content loading.</p>; // ノートが存在しない場合

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* ノートタイトル */}
      <h1 className="text-3xl font-bold mb-2">{note.title}</h1>

      {/* 作成日時と更新日時 */}
      <div className="text-sm text-gray-500 mb-4">
        Created: {new Date(note.createdAt).toLocaleString()} | Updated:{" "}
        {new Date(note.updatedAt).toLocaleString()}
      </div>

      {/* タグ表示 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {note.tags.map((t) => (
          <span
            key={t}
            className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm"
          >
            {t}
          </span>
        ))}
      </div>

      {/* エディタ本体 */}
      <TiptapEditor
        content={editorContent} // ステートで管理している内容を渡す
        onChange={handleContentChange} // 内容が変わったときにステート更新
        editable={true} // 常に編集可能（Notion風）
      />

      {/* 削除ボタン */}
      <div className="flex space-x-2 mt-4">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteDetail;
