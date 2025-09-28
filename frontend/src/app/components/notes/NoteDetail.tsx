// frontend/src/app/components/notes/NoteDetail.tsx
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { useAuth } from "../../hooks/useAuth";
import { INote } from "../../../types";
import {
  deleteNote,
  getNoteById,
  updateNote,
  createNote,
} from "@/services/noteService";
import TiptapEditor from "./TiptapEditor";
import { defaultMarkdownSerializer } from "prosemirror-markdown";
import { JSONContent } from "@tiptap/core";
import { Node } from "prosemirror-model";

interface NoteDetailProps {
  noteId?: string | null;
  onDelete?: () => void;
  editable?: boolean;

  // CreatePage 用
  onChangeContent?: (content: JSONContent) => Promise<void>;
  isCreateMode?: boolean;
  title?: string; // optional に変更
  setTitle?: Dispatch<SetStateAction<string>>; // optional に変更
  tags?: string[]; // optional に変更
  setTags?: Dispatch<SetStateAction<string[]>>; // optional に変更
}

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const NoteDetail: React.FC<NoteDetailProps> = ({
  noteId = null,
  onDelete,
  editable = true,
  onChangeContent,
  isCreateMode = false,
  title: propTitle,
  setTitle: propSetTitle,
  tags: propTags,
  setTags: propSetTags,
}) => {
  const { user, token, loading } = useAuth();
  const [note, setNote] = useState<INote | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [error, setError] = useState("");

  const [editorContent, setEditorContent] = useState<JSONContent>({
    type: "doc",
    content: [],
  });

  // title / tags は props があればそれを使い、なければ state で管理
  const [title, setTitle] = useState(propTitle || "");
  const [tags, setTags] = useState<string[]>(propTags || []);
  const initialLoadRef = useRef(true);

  // props が更新されたときも state を同期
  useEffect(() => {
    if (propTitle !== undefined) setTitle(propTitle);
  }, [propTitle]);

  useEffect(() => {
    if (propTags !== undefined) setTags(propTags);
  }, [propTags]);

  // 既存ノート取得（作成モードでなければ）
  useEffect(() => {
    if (!user || !token || !noteId || isCreateMode) return;

    const fetchNote = async () => {
      setLoadingNote(true);
      try {
        const found = await getNoteById(noteId, token);
        setNote(found);
        setEditorContent(found.content || { type: "doc", content: [] });

        if (!propTitle) setTitle(found.title || "");
        if (!propTags) setTags(found.tags || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch note");
      } finally {
        setLoadingNote(false);
      }
    };

    fetchNote();
  }, [user, token, noteId, isCreateMode, propTitle, propTags]);

  // 自動保存処理
  const autoSave = useRef(
    debounce(async (content: JSONContent) => {
      try {
        if (isCreateMode && onChangeContent) {
          await onChangeContent(content);
        } else if (!isCreateMode && token && (noteId || note?._id)) {
          const docNode = content as unknown as Node;
          const markdown = defaultMarkdownSerializer.serialize(docNode);
          const payload = { title, tags, content, markdown };
          const updated = await updateNote(
            note?._id || noteId!,
            payload,
            token
          );
          setNote(updated);
          console.log("Auto-saved note");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to auto-save note"
        );
      }
    }, 2000)
  ).current;

  // editorContent が変更されたら自動保存
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    if (editorContent) autoSave(editorContent);
  }, [editorContent, title, tags, noteId]);

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

  const handleContentChange = (content: JSONContent) => {
    setEditorContent(content);
  };

  if (loading || loadingNote) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* タイトル */}
      <input
        type="text"
        value={title}
        onChange={(e) =>
          propSetTitle ? propSetTitle(e.target.value) : setTitle(e.target.value)
        }
        placeholder="Title"
        className="w-full text-3xl font-bold mb-2 border-b focus:outline-none"
      />

      {/* 作成/更新日時 */}
      {!isCreateMode && note?._id && (
        <div className="text-sm text-gray-500 mb-4">
          Created: {new Date(note.createdAt).toLocaleString()} | Updated:{" "}
          {new Date(note.updatedAt).toLocaleString()}
        </div>
      )}

      {/* タグ */}
      <input
        type="text"
        value={tags.join(", ")}
        onChange={(e) =>
          propSetTags
            ? propSetTags(e.target.value.split(",").map((t) => t.trim()))
            : setTags(e.target.value.split(",").map((t) => t.trim()))
        }
        placeholder="Tags (comma separated)"
        className="w-full mb-4 border rounded px-3 py-1 focus:outline-none"
      />

      {/* エディタ */}
      <TiptapEditor
        content={editorContent}
        onChange={handleContentChange}
        editable={editable}
      />

      {/* 削除ボタン */}
      {!isCreateMode && note?._id && (
        <div className="flex space-x-2 mt-4">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteDetail;
