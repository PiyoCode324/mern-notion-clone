// frontend/src/app/components/notes/NoteDetail.tsx
"use client";

import React, { useEffect, useState, useRef } from "react"; // 🚨 useRefと追加のimport
import { useAuth } from "../../hooks/useAuth";
import { INote } from "../../../types";
import { deleteNote, getNoteById, updateNote } from "@/services/noteService";
import TiptapEditor from "./TiptapEditor";
import { defaultMarkdownSerializer } from "prosemirror-markdown";
import { JSONContent } from "@tiptap/core";
import { Node } from "prosemirror-model";

interface NoteDetailProps {
  noteId: string | null;
  onDelete?: () => void;
}

// デバウンス処理のためのユーティリティ関数（内部で定義）
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const NoteDetail: React.FC<NoteDetailProps> = ({ noteId, onDelete }) => {
  const { user, token, loading } = useAuth();
  const [note, setNote] = useState<INote | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [error, setError] = useState("");
  // const [editing, setEditing] = useState(false); // 🚨 編集ステートは削除

  // エディタの現在のコンテンツを保持するステート
  const [editorContent, setEditorContent] = useState<JSONContent | undefined>(
    undefined
  );
  // 初回ロード完了フラグ（自動保存のトリガーを避けるため）
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!user || !token || !noteId) return;

    const fetchNote = async () => {
      setLoadingNote(true);
      try {
        const found = await getNoteById(noteId, token);
        setNote(found);
        setEditorContent(found.content || { type: "doc", content: [] }); // 🚨 コンテンツをステートに設定
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch note");
      } finally {
        setLoadingNote(false);
      }
    };

    fetchNote();
  }, [user, token, noteId]);

  // 🚨 自動保存ロジック (デバウンス付き)
  const autoSave = useRef(
    debounce(async (content: JSONContent) => {
      if (!note || !token) return;

      try {
        const docNode = content as unknown as Node;
        const markdown = defaultMarkdownSerializer.serialize(docNode);

        const updatedNote = await updateNote(
          note._id,
          { content, markdown },
          token
        );
        // setNote(updatedNote); // Noteオブジェクト全体を更新するとエディタが再レンダリングされすぎるため、一旦コメントアウト
        console.log("Note saved automatically.");
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save note automatically"
        );
      }
    }, 1000)
  ).current; // 1秒間のデバウンスを設定

  // 🚨 editorContentが変更されたときに自動保存をトリガーするuseEffect
  useEffect(() => {
    if (initialLoadRef.current) {
      // 初回ロード時（noteが設定されたとき）はスキップ
      initialLoadRef.current = false;
      return;
    }

    // editorContentが存在し、かつnoteが存在すれば自動保存
    if (editorContent && note) {
      autoSave(editorContent);
    }
  }, [editorContent, note]); // noteが変更された際もcontentを再評価するためnoteも依存配列に追加

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      if (!note) return;
      await deleteNote(note._id, token!);
      if (onDelete) onDelete();
      setNote(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  // TiptapEditorのonChangeハンドラ
  const handleContentChange = (content: JSONContent) => {
    setEditorContent(content);
  };

  if (loading || loadingNote) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!note || !editorContent)
    return <p className="p-4">Note not found or content loading.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
      <div className="text-sm text-gray-500 mb-4">
        Created: {new Date(note.createdAt).toLocaleString()} | Updated:{" "}
        {new Date(note.updatedAt).toLocaleString()}
      </div>
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

      <TiptapEditor
        content={editorContent} // 🚨 ステートからコンテンツを渡す
        onChange={handleContentChange} // 🚨 変更ハンドラを渡す
        editable={true} // 🚨 Notionのように常に編集可能とする
      />

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
