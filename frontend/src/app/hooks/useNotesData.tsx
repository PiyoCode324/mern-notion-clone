// frontend/src/app/hooks/useNotesData.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
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
  >("idle");

  const fetchAndBuildTree = useCallback(async (currentToken: string | null) => {
    if (!currentToken) {
      console.log("[NoteProvider] No token, skipping fetch");
      setLoadingNotes(false);
      setRefreshStatus("idle");
      return;
    }

    console.log("[NoteProvider] Fetching notes with token:", currentToken);
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
    if (!authLoading) {
      fetchAndBuildTree(token);
    }
  }, [authLoading, token, fetchAndBuildTree]);

  const refreshNotes = async () => {
    if (token) {
      try {
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
      {children}
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
