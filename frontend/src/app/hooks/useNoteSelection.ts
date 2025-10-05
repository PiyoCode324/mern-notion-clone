// src/app/hooks/useNoteSelection.ts

import { useState, useCallback } from 'react';

/**
 * ノート選択状態を管理するためのインターフェース。
 */
interface NoteSelectionStore {
  /** 現在選択されているノートのID。未選択の場合は null。 */
  selectedNoteId: string | null;
  /** 選択状態を更新する関数。 */
  setSelectedNoteId: (id: string | null) => void;
}

/**
 * 💡 選択状態を一元管理するカスタムフック。
 * useContext/Zustandがない場合の簡易的なグローバルステートの代替として使用。
 * (実際のアプリケーションではコンテキストプロバイダでラップして使用することを推奨)
 */
const useNoteSelection = (): NoteSelectionStore => {
  // 選択されたノートIDを保持する内部ステート
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // 外部に公開するID設定関数をメモ化
  const setSelectedNoteIdCallback = useCallback((id: string | null) => {
    console.log(`[NoteSelection] New note selected: ${id}`);
    setSelectedNoteId(id);
  }, []);

  return {
    selectedNoteId,
    setSelectedNoteId: setSelectedNoteIdCallback,
  };
};

export default useNoteSelection;