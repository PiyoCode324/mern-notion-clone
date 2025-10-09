// frontend/src/services/noteService.ts
import { INote, NoteDocument } from "@/types";

const API_URL = "http://localhost:5000/api/notes";

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[noteService] API error:", res.status, data);
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
};

export const getAllNotes = async (token: string): Promise<NoteDocument[]> => {
  console.log("[noteService] getAllNotes token:", token);

  const res = await fetch(API_URL, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("[noteService] getAllNotes response status:", res.status);

  const rawNotes: INote[] = await handleResponse(res);

  const clientNotes: NoteDocument[] = rawNotes.map((note) => ({
    ...note,
    id: note._id,
  }));

  return clientNotes;
};

export const getNotes = getAllNotes;

export const getNoteById = async (
  id: string,
  token: string
): Promise<NoteDocument> => {
  console.log("[noteService] getNoteById id:", id, "token:", token);

  const res = await fetch(`${API_URL}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("[noteService] getNoteById response status:", res.status);

  const rawNote: INote = await handleResponse(res);
  const clientNote: NoteDocument = {
    ...rawNote,
    id: rawNote._id,
  };

  return clientNote;
};

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

  const rawNote: INote = await handleResponse(res);
  const clientNote: NoteDocument = {
    ...rawNote,
    id: rawNote._id,
  };

  return clientNote;
};

export const deleteNote = async (id: string, token: string): Promise<void> => {
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
