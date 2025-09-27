// frontend/src/app/components/notes/TiptapEditor.tsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import { EditorContent, Editor } from "@tiptap/react";
import { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit"; // これ一つで基本機能（太字、斜体、見出し、リスト、履歴など）をカバー

// カスタム設定が必要な拡張機能のみ残します
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";

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
      const newEditor = new Editor({
        extensions: [
          // ✅ StarterKitを導入し、基本機能とInput Ruleをすべて任せる
          StarterKit.configure({
            // Document, Paragraph, Text, History, Bold, Italic, Code, Blockquoteなどが含まれる

            // Headingのレベル設定のみカスタムで上書き
            heading: {
              levels: [1, 2, 3],
            },

            // Link拡張機能は別途設定するため、StarterKitのLink機能は無効化（オプション）
            link: false,
          }),

          // カスタム設定が必要な拡張機能は別途追加
          CodeBlock.configure({ defaultLanguage: "javascript" }),
          Link.configure({
            openOnClick: false,
            HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
          }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
          const json = editor.getJSON();
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
        newEditor.destroy();
      };
    }
  }, []);

  // ... (後続の useEffect は変更なし)

  // contentプロパティが変更されたらエディタの内容を更新
  useEffect(() => {
    if (editor && contentRef.current !== content) {
      const isContentEqual =
        JSON.stringify(editor.getJSON()) === JSON.stringify(content);

      if (!isContentEqual) {
        editor.commands.setContent(content);
      }
      contentRef.current = content;
    }
  }, [editor, content]);

  // editableプロパティが変更されたらエディタの状態を更新
  useEffect(() => {
    if (editor && editor.options.editable !== editable) {
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

