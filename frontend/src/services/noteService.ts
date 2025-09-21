// frontend/src/services/noteService.ts
import { INote } from "@/types";

const API_URL = "http://localhost:5000/api/notes";

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
};

// ノート一覧取得
export const getNotes = async (token: string): Promise<INote[]> => {
  const res = await fetch(API_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await handleResponse(res);
};

// ノート作成
export const createNote = async (
  noteData: Partial<INote>,
  token: string
): Promise<INote> => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });
  return await handleResponse(res);
};

// ノート更新
export const updateNote = async (
  id: string,
  noteData: Partial<INote>,
  token: string
): Promise<INote> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });
  return await handleResponse(res);
};

// ノート削除
export const deleteNote = async (id: string, token: string): Promise<void> => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  // 削除成功時はレスポンスボディが空の場合があるため、`handleResponse`は使わない
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to delete note");
  }
};
