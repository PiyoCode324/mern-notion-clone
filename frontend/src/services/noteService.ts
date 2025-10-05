// frontend/src/services/noteService.ts
// 💡 NoteDocument をインポートリストに追加
import { INote, NoteDocument } from "@/types";

const API_URL = "http://localhost:5000/api/notes";

// レスポンスハンドラは変更なし
const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[noteService] API error:", res.status, data);
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
};

// 💡 [修正済み] getAllNotes の URL から "/all" を削除
// 💡 [追加] getNotes という別名でもエクスポートします
export const getAllNotes = async (token: string): Promise<NoteDocument[]> => {
  // 💡 API_URL をそのまま使用します（バックエンドは `/api/notes` で全ノートを取得するように設定済み）
  const ALL_NOTES_URL = API_URL;

  console.log("[noteService] getAllNotes token:", token);
  const res = await fetch(ALL_NOTES_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("[noteService] getAllNotes response status:", res.status);

  const rawNotes: INote[] = await handleResponse(res);

  // 💡 変換処理: INote[] を NoteDocument[] にマップする
  const clientNotes: NoteDocument[] = rawNotes.map((note) => ({
    // INote が持つ全てのプロパティをコピー
    ...note,
    // _id を id に変換する
    id: note._id,
    // NoteDocument が持つべき children は buildTree で設定されるため、ここでは不要
  }));

  return clientNotes;
};

// 互換性のために getAllNotes と同じ関数を getNotes としてエクスポート
export const getNotes = getAllNotes;

export const getNoteById = async (
  id: string,
  token: string
): Promise<NoteDocument> => {
  // 💡 [修正] getNoteById の戻り値も NoteDocument に変更
  console.log("[noteService] getNoteById id:", id, "token:", token);
  const res = await fetch(`${API_URL}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("[noteService] getNoteById response status:", res.status);

  // 💡 取得した INote に id を追加して NoteDocument に変換して返す
  const rawNote: INote = await handleResponse(res);
  const clientNote: NoteDocument = {
    ...rawNote,
    id: rawNote._id,
  };
  return clientNote;
};

// 💡 createNote の戻り値も NoteDocument に変更
export const createNote = async (
  noteData: {
    title: string;
    content?: any;
    parentId: string | null;
    order: number;
  },
  token: string
): Promise<NoteDocument> => {
  console.log("[noteService] createNote data:", noteData, "token:", token);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });
  console.log("[noteService] createNote response status:", res.status);

  // 💡 取得した INote に id を追加して NoteDocument に変換して返す
  const rawNote: INote = await handleResponse(res);
  const clientNote: NoteDocument = {
    ...rawNote,
    id: rawNote._id,
  };
  return clientNote;
};

export const updateNote = async (
  id: string,
  noteData: Partial<INote>,
  token: string
): Promise<NoteDocument> => {
  // 💡 [修正] updateNote の戻り値も NoteDocument に変更
  console.log(
    "[noteService] updateNote id:",
    id,
    "data:",
    noteData,
    "token:",
    token
  );
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });
  console.log("[noteService] updateNote response status:", res.status);

  // 💡 取得した INote に id を追加して NoteDocument に変換して返す
  const rawNote: INote = await handleResponse(res);
  const clientNote: NoteDocument = {
    ...rawNote,
    id: rawNote._id,
  };
  return clientNote;
};

export const deleteNote = async (id: string, token: string): Promise<void> => {
  // 削除ロジックは変更なし
  console.log("[noteService] deleteNote id:", id, "token:", token);
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("[noteService] deleteNote response status:", res.status);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.error("[noteService] deleteNote error:", res.status, data);
    throw new Error(data.error || "Failed to delete note");
  }
};
