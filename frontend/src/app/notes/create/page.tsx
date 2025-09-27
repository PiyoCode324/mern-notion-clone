// frontend/src/app/notes/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { createNote } from "@/services/noteService";
import { EditorContent, useEditor, JSONContent } from "@tiptap/react";
import Link from "@tiptap/extension-link";

// 🚨 修正: StarterKitを削除し、コア機能とMarkdown機能を個別にインポート
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

// ブロック要素
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
// -------------------------------------------------------------

export default function CreateNotePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  // Tiptapエディタのセットアップを更新
  const editor = useEditor({
    extensions: [
      // 🚨 修正: StarterKitを削除し、必要な拡張機能を直接追加
      Document,
      Paragraph,
      Text,

      Link,

      // Notion風のブロック機能を実現するための拡張機能を明示的に追加
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      CodeBlock,
    ],
    content: { type: "doc", content: [] } as JSONContent,
    editorProps: {
      attributes: {
        // Notion風の見た目にするためのカスタムクラスを追加
        className:
          "notion-editor border p-2 rounded min-h-[200px] focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (loading) return <p className="p-4">Loading...</p>;
  if (!user || !token) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      await createNote(
        {
          title,
          content: editor?.getJSON() || { type: "doc", content: [] },
          // contentはJSONContentなので、`TiptapEditor.tsx`で行っているのと同じく
          // バックエンドにJSON形式で送信されることを想定
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
        token
      );
      router.push("/notes");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Note</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Content</label>
          {/* EditorContent */}
          <EditorContent editor={editor} />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
        >
          {creating ? "Creating..." : "Create Note"}
        </button>
      </form>
    </div>
  );
}
