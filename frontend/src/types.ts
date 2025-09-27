// frontend/src/types.ts
import { JSONContent } from "@tiptap/react";

export interface INote {
  _id: string;
  title: string;
  content: JSONContent;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  markdown:string;
}
