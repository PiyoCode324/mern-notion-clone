// frontend/src/components/TiptapEditor.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { EditorContent, Editor } from "@tiptap/react";
import { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    codeBlock: false, // StarterKit の codeBlock を無効化
    link: false,
  }),
  CodeBlock.configure({ defaultLanguage: "javascript" }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
  }),
];

interface TiptapEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  editable?: boolean;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  editable = true,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const contentRef = useRef(content);

  useEffect(() => {
    if (!editor) {
      console.log(
        "[TiptapEditor] Initializing editor with content:",
        JSON.stringify(content, null, 2)
      );
      const newEditor = new Editor({
        extensions: editorExtensions,
        content,
        editable,
        onUpdate: ({ editor }) => {
          const json = editor.getJSON();
          console.log(
            "[TiptapEditor] onUpdate triggered with:",
            JSON.stringify(json, null, 2)
          );
          onChange(json);
        },
        editorProps: {
          attributes: {
            class:
              "border p-2 rounded notion-editor min-h-[200px] focus:outline-none",
          },
        },
      });

      setEditor(newEditor);

      return () => {
        console.log("[TiptapEditor] Destroying editor");
        newEditor.destroy();
      };
    }
  }, []);

  useEffect(() => {
    if (editor && contentRef.current !== content) {
      const isContentEqual =
        JSON.stringify(editor.getJSON()) === JSON.stringify(content);
      if (!isContentEqual) {
        console.log(
          "[TiptapEditor] Setting editor content to:",
          JSON.stringify(content, null, 2)
        );
        editor.commands.setContent(content);
      }
      contentRef.current = content;
    }
  }, [editor, content]);

  useEffect(() => {
    if (editor && editor.options.editable !== editable) {
      console.log("[TiptapEditor] Setting editable to:", editable);
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  if (!editor) {
    return (
      <div className="border p-2 rounded notion-editor min-h-[200px]">
        Loading Editor...
      </div>
    );
  }

  return <EditorContent editor={editor} />;
};

export default TiptapEditor;
