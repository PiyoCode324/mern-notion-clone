// frontend/src/app/components/notes/NoteDetail.tsx
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
import { NoteDocument } from "@/types";
import { deleteNote, getNoteById, updateNote } from "@/services/noteService";
import TiptapEditor, { editorExtensions } from "./TiptapEditor";
import { JSONContent } from "@tiptap/core";
import { generateText } from "@tiptap/core";
import { useRouter } from "next/navigation";

// デバウンス関数
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface NoteDetailProps {
  noteId?: string | null;
  onDelete?: () => void;
  editable?: boolean;
  isCreateMode?: boolean;
  title?: string;
  setTitle?: Dispatch<SetStateAction<string>>;
  tags?: string[];
  setTags?: Dispatch<SetStateAction<string[]>>;
}

const NoteDetail: React.FC<NoteDetailProps> = ({
  noteId = null,
  onDelete,
  editable = true,
  isCreateMode = false,
  title: propTitle,
  setTitle: propSetTitle,
  tags: propTags,
  setTags: propSetTags,
}) => {
  const { user, token, loading } = useAuth();
  const [note, setNote] = useState<NoteDocument | null>(null);
  const [loadingNote, setLoadingNote] = useState(true);
  const [error, setError] = useState("");

  const [localTitle, setLocalTitle] = useState("");
  const [localTags, setLocalTags] = useState<string[]>([]);

  const currentTitle = propTitle !== undefined ? propTitle : localTitle;
  const currentSetTitle =
    propSetTitle !== undefined ? propSetTitle : setLocalTitle;
  const currentTags = propTags !== undefined ? propTags : localTags;
  const currentSetTags = propSetTags !== undefined ? propSetTags : setLocalTags;

  const router = useRouter();
  const [editorContent, setEditorContent] = useState<JSONContent>({
    type: "doc",
    content: [],
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // ノートデータ取得
  useEffect(() => {
    if (loading || !user || !token || !noteId || isCreateMode) {
      setLoadingNote(false);
      return;
    }

    const fetchNote = async () => {
      setLoadingNote(true);
      try {
        const found = await getNoteById(noteId, token);
        setNote(found);
        setEditorContent(found.content || { type: "doc", content: [] });
        setLastSavedAt(found.updatedAt);

        if (propTitle === undefined) currentSetTitle(found.title || "");
        if (propTags === undefined) currentSetTags(found.tags || []);
      } catch (err: unknown) {
        console.error("[NoteDetail] Fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch note");
      } finally {
        setLoadingNote(false);
      }
    };

    fetchNote();
  }, [
    loading,
    user,
    token,
    noteId,
    isCreateMode,
    currentSetTitle,
    currentSetTags,
  ]);

  // ----------------------------------------------------
  // オートセーブ処理
  // ----------------------------------------------------
  const debouncedSave = useRef(
    debounce(
      async (
        currentTitleValue: string,
        currentTagsValue: string[],
        content: JSONContent,
        currentToken: string,
        currentNoteId: string,
        updateLastSavedAt: (timestamp: string) => void
      ) => {
        try {
          const markdown = generateText(content, editorExtensions);
          const payload = {
            title: currentTitleValue,
            tags: currentTagsValue,
            content,
            markdown,
          };
          const updated = await updateNote(
            currentNoteId,
            payload,
            currentToken
          );
          updateLastSavedAt(updated.updatedAt);
        } catch (err: unknown) {
          console.error("[NoteDetail] Auto-save error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to auto-save note"
          );
        }
      },
      1000
    )
  ).current;

  useEffect(() => {
    if (!editable || !noteId || !token || isCreateMode) return;
    debouncedSave(
      currentTitle,
      currentTags,
      editorContent,
      token,
      noteId,
      setLastSavedAt
    );
  }, [
    currentTitle,
    currentTags,
    editorContent,
    token,
    noteId,
    editable,
    isCreateMode,
    debouncedSave,
  ]);

  // ----------------------------------------------------
  // 削除処理
  // ----------------------------------------------------
  const handleDelete = async () => {
    if (!noteId || !token) return;
    try {
      await deleteNote(noteId, token);
      if (onDelete) onDelete();
      router.push("/");
    } catch (err) {
      console.error("[NoteDetail] Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  if (loadingNote) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full h-full flex flex-col space-y-4 p-4">
      {/* タイトル */}
      <input
        type="text"
        value={currentTitle}
        onChange={(e) => currentSetTitle(e.target.value)}
        placeholder="Untitled"
        className="text-xl font-bold border-b pb-1 focus:outline-none"
        disabled={!editable}
      />

      {/* タグ */}
      <input
        type="text"
        value={currentTags.join(", ")}
        onChange={(e) =>
          currentSetTags(e.target.value.split(",").map((t) => t.trim()))
        }
        placeholder="Tags"
        className="text-sm border-b pb-1 focus:outline-none"
        disabled={!editable}
      />

      {/* Tiptap Editor */}
      <div className="flex-1 overflow-auto">
        <TiptapEditor
          content={editorContent}
          onChange={setEditorContent}
          editable={editable}
        />
      </div>

      {/* 操作ボタン */}
      <div className="flex space-x-2">
        {editable && !isCreateMode && (
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}
        {lastSavedAt && (
          <span className="text-gray-500 text-sm self-center">
            Last saved: {new Date(lastSavedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
