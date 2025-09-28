// frontend/src/app/components/notes/TiptapEditor.tsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import { EditorContent, Editor } from "@tiptap/react"; // Tiptapのエディタ本体と表示用コンポーネント
import { JSONContent } from "@tiptap/core"; // エディタの内容をJSON形式で扱うための型
import StarterKit from "@tiptap/starter-kit"; // 基本的な拡張機能（見出し、太字、斜体、リスト、履歴など）をまとめて提供

// 追加でカスタム設定が必要な拡張機能
import CodeBlock from "@tiptap/extension-code-block"; // コードブロック
import Link from "@tiptap/extension-link"; // リンク

// このコンポーネントに渡されるpropsの型定義
interface TiptapEditorProps {
  content: JSONContent; // エディタの初期コンテンツ（JSON形式）
  onChange: (content: JSONContent) => void; // コンテンツ変更時に親へ渡すコールバック
  editable?: boolean; // 編集可能かどうか（既定はtrue）
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  editable = true,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null); // Tiptapエディタ本体を保持するステート
  const contentRef = useRef(content); // 前回のcontentを保持して比較に使うRef

  // 初期化処理（エディタインスタンスの生成）
  useEffect(() => {
    if (!editor) {
      const newEditor = new Editor({
        extensions: [
          // ✅ StarterKit導入で基本機能を一括有効化
          StarterKit.configure({
            // Document, Paragraph, Text, History, Bold, Italic, Code, Blockquoteなどが含まれる

            // 見出し（Heading）は1〜3までをサポート
            heading: {
              levels: [1, 2, 3],
            },

            // LinkはStarterKitに含まれるが、独自設定を使うので無効化
            link: false,
          }),

          // ✅ カスタム設定が必要な拡張機能を追加
          CodeBlock.configure({ defaultLanguage: "javascript" }), // デフォルト言語はJavaScript
          Link.configure({
            openOnClick: false, // エディタ上でクリックしても即ジャンプしない
            HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" }, // 安全性とUXのための属性
          }),
        ],
        content, // 初期コンテンツをセット
        editable, // 編集可能かどうか
        onUpdate: ({ editor }) => {
          // コンテンツが変更されたときの処理
          const json = editor.getJSON(); // JSON形式で取得
          onChange(json); // 親コンポーネントに渡す
        },
        editorProps: {
          // エディタ本体のHTML属性（クラスなど）
          attributes: {
            class:
              "border p-2 rounded notion-editor min-h-[200px] focus:outline-none",
          },
        },
      });

      setEditor(newEditor); // ステートに格納して利用可能にする

      // クリーンアップ処理（アンマウント時にエディタを破棄）
      return () => {
        newEditor.destroy();
      };
    }
  }, []); // 初回のみ実行

  // ✅ contentプロパティが変更されたときにエディタ内容を更新
  useEffect(() => {
    if (editor && contentRef.current !== content) {
      // 現在のエディタ内容とpropsのcontentを比較
      const isContentEqual =
        JSON.stringify(editor.getJSON()) === JSON.stringify(content);

      // 差分がある場合のみエディタ内容を更新（無駄な再描画を防止）
      if (!isContentEqual) {
        editor.commands.setContent(content);
      }
      contentRef.current = content; // 最新のcontentを記録
    }
  }, [editor, content]);

  // ✅ editableプロパティが変更されたときにエディタの編集可否を更新
  useEffect(() => {
    if (editor && editor.options.editable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // エディタがまだ生成されていない間のプレースホルダー
  if (!editor) {
    return (
      <div className="border p-2 rounded notion-editor min-h-[200px]">
        Loading Editor...
      </div>
    );
  }

  // 実際のエディタ表示
  return <EditorContent editor={editor} />;
};

export default TiptapEditor;
