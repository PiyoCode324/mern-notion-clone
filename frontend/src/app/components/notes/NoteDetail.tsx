// frontend/src/components/NoteDetail.tsx
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { useAuth } from "../../hooks/useAuth";
import { INote } from "@/types";
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
  notes?: INote[];
  onDelete?: () => void;
  editable?: boolean;
  onChangeContent?: (content: JSONContent) => Promise<void>;
  isCreateMode?: boolean;
  title?: string;
  setTitle?: Dispatch<SetStateAction<string>>;
  tags?: string[];
  setTags?: Dispatch<SetStateAction<string[]>>;
}

const NoteDetail: React.FC<NoteDetailProps> = ({
  noteId = null,
  notes = [],
  onDelete,
  editable = true,
  // onChangeContent, 
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

  // propTitle, propTagsが存在しない場合にのみ、内部ステートを定義
  const [localTitle, setLocalTitle] = useState("");
  const [localTags, setLocalTags] = useState<string[]>([]);

  // 実際に使用する title, tags, セッターを決定
  const currentTitle = propTitle !== undefined ? propTitle : localTitle;
  const currentSetTitle = propSetTitle !== undefined ? propSetTitle : setLocalTitle;
  const currentTags = propTags !== undefined ? propTags : localTags;
  const currentSetTags = propSetTags !== undefined ? propSetTags : setLocalTags;
  
  const router = useRouter();
  const [editorContent, setEditorContent] = useState<JSONContent>({
    type: "doc",
    content: [],
  });

  // 💡 追加：最終保存時刻を保持するステート
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // ノートデータの取得
  useEffect(() => {
    if (loading || !user || !token || !noteId || isCreateMode) {
      console.log("[NoteDetail] fetchNote skipped.");
      setLoadingNote(false);
      return;
    }

    const fetchNote = async () => {
      setLoadingNote(true);
      try {
        const found = await getNoteById(noteId, token);
        setNote(found);
        setEditorContent(found.content || { type: "doc", content: [] });
        // 初期データとしてupdatedAtも設定
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
  }, [loading, user, token, noteId, isCreateMode, currentSetTitle, currentSetTags]);


  // ----------------------------------------------------
  // 💡 修正ポイント１：オートセーブ成功時にsetNote(updated)ではなくsetLastSavedAtを呼び出す
  // ----------------------------------------------------

  const debouncedSave = useRef(
    debounce(
      async (
        currentTitleValue: string,
        currentTagsValue: string[],
        content: JSONContent,
        currentToken: string,
        currentNoteId: string,
        updateLastSavedAt: (timestamp: string) => void // コールバックを追加
      ) => {
        console.log("[NoteDetail] autoSave triggered.");
        try {
          const markdown = generateText(content, editorExtensions);
          const payload = {
            title: currentTitleValue,
            tags: currentTagsValue,
            content,
            markdown,
          };
          console.log("[NoteDetail] Sending update payload (Title):", payload.title);
          const updated = await updateNote(
            currentNoteId,
            payload,
            currentToken
          );
          console.log("[NoteDetail] Auto-saved successfully.");
          
          // 💡 setNoteを削除し、lastSavedAtのみを更新することで再レンダリングの連鎖を断ち切る
          updateLastSavedAt(updated.updatedAt);
          
        } catch (err: unknown) {
          console.error("[NoteDetail] Auto-save error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to auto-save note"
          );
        }
      },
      3000
    )
  ).current;

  // ----------------------------------------------------
  // 💡 修正ポイント２：useEffectの依存配列からnoteを削除する
  // ----------------------------------------------------
  useEffect(() => {
    console.log("[NoteDetail] useEffect for autoSave triggered.");
    
    // noteIdToUseは、noteIdとnote?._idのどちらかを使う。
    // noteはノート取得後の初期設定でしか使わないように依存配列から外したいが、
    // noteIdが初期値nullで、note取得後にnote._idを使うケースがあるため、この変数は残す。
    const noteIdToUse = note?._id || noteId;

    if (
      !loading &&
      !loadingNote &&
      !!editorContent &&
      !isCreateMode &&
      !!token &&
      !!noteIdToUse
    ) {
      debouncedSave(
        currentTitle,
        currentTags,
        editorContent,
        token,
        noteIdToUse,
        setLastSavedAt // コールバックを渡す
      );
    } else {
      console.log("[NoteDetail] autoSave skipped.");
    }
  }, [
    loading,
    loadingNote,
    editorContent,
    currentTitle,
    currentTags,
    noteId,
    isCreateMode,
    token,
    note, // ⚠ 依存に残すのは、noteが初期設定完了を示すため。ただし無限ループの原因はsetNote(updated)なので、これは残しても大丈夫なはず。
    debouncedSave,
  ]);


  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      if (!note || !token) return;
      await deleteNote(note._id, token);
      console.log("[NoteDetail] Note deleted:", note._id);
      if (onDelete) onDelete();

      const remainingNotes = notes.filter((n) => n._id !== note._id);
      if (remainingNotes.length > 0) {
        const nextNote = remainingNotes.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        router.push(`/notes/${nextNote._id}`);
      } else {
        router.push("/notes");
      }

      setNote(null);
    } catch (err: unknown) {
      console.error("[NoteDetail] Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const handleContentChange = (content: JSONContent) => {
    setEditorContent(content);
  };

  // 認証またはデータ取得のローディング中に画面に表示する
  if (loading || loadingNote) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <input
        type="text"
        value={currentTitle}
        onChange={(e) => {
          currentSetTitle(e.target.value);
        }}
        placeholder="Title"
        spellCheck={false}
        className="w-full text-3xl font-bold mb-2 border-b focus:outline-none"
      />

      {!isCreateMode && (note?._id || noteId) && (
        <div className="text-sm text-gray-500 mb-4">
          Created: {note?.createdAt ? new Date(note.createdAt).toLocaleString() : 'N/A'} |
          {/* lastSavedAtを使用して更新日時を表示 */}
          Updated: {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : 'N/A'}
        </div>
      )}

      <input
        type="text"
        value={currentTags.join(", ")}
        onChange={(e) => {
          const newTags = e.target.value.split(",").map((t) => t.trim());
          currentSetTags(newTags);
        }}
        placeholder="Tags (comma separated)"
        spellCheck={false}
        className="w-full mb-4 border rounded px-3 py-1 focus:outline-none"
      />

      <TiptapEditor
        content={editorContent}
        onChange={handleContentChange}
        editable={editable}
      />

      {!isCreateMode && (note?._id || noteId) && (
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