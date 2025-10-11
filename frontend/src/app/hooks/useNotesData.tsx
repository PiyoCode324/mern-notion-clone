// frontend/src/app/hooks/useNotesData.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef, // 💡 useRef をインポート
} from "react";
import { NoteDocument } from "@/types";
import { getAllNotes } from "@/services/noteService";
import { useAuthContext } from "@/app/hooks/useAuthContext";

interface NoteTreeDocument extends NoteDocument {
  children?: NoteTreeDocument[];
}

const buildTree = (
  notes: NoteDocument[],
  parentId: string | null = null
): NoteTreeDocument[] => {
  return notes
    .filter((note) => (note.parentId || null) === parentId)
    .map((note) => ({
      ...note,
      children: buildTree(notes, note.id) as NoteTreeDocument[],
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

interface NoteContextType {
  noteTree: NoteTreeDocument[];
  flatNotes: NoteDocument[];
  loadingNotes: boolean;
  refreshNotes: () => Promise<void>;
  refreshStatus: "idle" | "refreshing" | "completed";
  updateNoteLocally: (
    id: string,
    updates: Partial<NoteDocument> | null
  ) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token, loading: authLoading } = useAuthContext();
  const [flatNotes, setFlatNotes] = useState<NoteDocument[]>([]);
  const [noteTree, setNoteTree] = useState<NoteTreeDocument[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState<
    "idle" | "refreshing" | "completed"
  >("idle"); // 💡 修正: 初期データフェッチが実行されたかどうかを追跡するための Ref

  const hasInitialFetchRunRef = useRef(false); // 💡 新しい Ref: 最後にフェッチしたトークンを記憶するための Ref
  const lastFetchedTokenRef = useRef<string | null>(null);

  const fetchAndBuildTree = useCallback(async (currentToken: string | null) => {
    if (!currentToken) {
      console.log("[NoteProvider] No token, skipping fetch");
      setLoadingNotes(false);
      setRefreshStatus("idle");
      return;
    }

    console.log("[NoteProvider] Fetching notes with token: [TRUNCATED]");
    setLoadingNotes(true);
    setRefreshStatus("refreshing");
    try {
      const data: NoteDocument[] = await getAllNotes(currentToken);
      console.log("[NoteProvider] Fetched notes:", data.length);
      setFlatNotes(data);
      const tree = buildTree(data, null);
      console.log("[NoteProvider] Built tree:", tree.length, "root nodes");
      setNoteTree(tree);
      setRefreshStatus("completed");
    } catch (error) {
      console.error("[NoteProvider] Failed to fetch notes:", error);
      setFlatNotes([]);
      setNoteTree([]);
      setRefreshStatus("idle");
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    // 💡 ロジック修正:
    // 1. 認証が完了し (authLoading=false)
    // 2. かつトークンが有効であり (token)、
    // 3. かつ、この有効トークンでまだ初期フェッチを実行していない (lastFetchedTokenRef のチェック)
    if (!authLoading && token && token !== lastFetchedTokenRef.current) {
      console.log("[NoteProvider] Auth ready. Triggering initial fetch.");
      fetchAndBuildTree(token).then(() => {
        lastFetchedTokenRef.current = token; // 💡 フェッチ成功後にトークンを記録
      });
    } else if (!authLoading && !token) {
      // 認証完了したがトークンがない（ログアウト状態）場合は、ロード状態を解除する
      setLoadingNotes(false);
      lastFetchedTokenRef.current = null; // 💡 トークンをクリア
    } // 💡 hasInitialFetchRunRef は不要になりましたが、より堅牢にするため lastFetchedTokenRef を使います // lastFetchedTokenRef.current が null の状態で fetchAndBuildTree が呼ばれても // 関数内でスキップされるため、authLoading のチェックで十分です。 // 🚨 ログアウト後にログインし直す場合も考慮し、 // lastFetchedTokenRef.current を使って、同じトークンで二度フェッチしないように制御しています。 // これで、StrictModeの二重発火（tokenが同じ値で2回設定される）を無視できます。
  }, [authLoading, token, fetchAndBuildTree]); // 依存配列は維持

  const refreshNotes = async () => {
    if (token) {
      try {
        // refreshNotes は常にフェッチを実行させる
        await fetchAndBuildTree(token);
      } catch (error) {
        console.error("[NoteProvider] refreshNotes failed:", error);
      }
    }
  };

  const updateNoteLocally = useCallback(
    (id: string, updates: Partial<NoteDocument> | null) => {
      setFlatNotes((prev) => {
        let newNotes: NoteDocument[];
        if (updates === null) {
          // 削除の場合
          newNotes = prev.filter((note) => note.id !== id);
          console.log("[NoteProvider] Removed note locally:", id);
        } else {
          // 更新の場合
          newNotes = prev.map((note) =>
            note.id === id ? { ...note, ...updates } : note
          );
          console.log("[NoteProvider] Updated note locally:", id, updates);
        }
        setNoteTree(buildTree(newNotes, null));
        return newNotes;
      });
    },
    []
  );

  return (
    <NoteContext.Provider
      value={{
        noteTree,
        flatNotes,
        loadingNotes,
        refreshNotes,
        refreshStatus,
        updateNoteLocally,
      }}
    >
            {children}   {" "}
    </NoteContext.Provider>
  );
};

export const useNotesData = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error("useNotesData must be used within a NoteProvider");
  }
  return context;
};
