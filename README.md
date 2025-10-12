# Notes App (Notion クローン)

Next.js 14（App Router）＋ TypeScript ＋ Firebase Authentication ＋ TipTap を使用した、簡単な Notion 風メモアプリです。  
ユーザーはノートを作成・編集・削除でき、階層構造で整理することができます。

---

## スクリーンショット

※実際に使用する場合は `screenshots/` フォルダに画像を配置してください。

| ホーム画面                    | ノート編集画面                             |
| ----------------------------- | ------------------------------------------ |
| ![Home](screenshots/home.png) | ![NoteDetail](screenshots/note_detail.png) |

---

## 主な機能

- Firebase 認証によるユーザー管理（Email/Password）
- ノートの作成・編集・削除
- 親子ノートによる階層構造の管理
- TipTap エディタによるリッチテキスト編集
- Markdown 対応
- サイドバーでのツリー表示（折りたたみ可能）
- モバイル対応レスポンシブデザイン
- UI の楽観的更新（即時反映）

---

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, React 18
- **スタイリング**: TailwindCSS
- **エディタ**: TipTap (`@tiptap/react`)
- **認証**: Firebase Authentication
- **アイコン**: Lucide React
- **Markdown**: `react-markdown`, `prosemirror-markdown`
- **ユーティリティ**: Lodash
- **バックエンド API**: Node.js + Express + MongoDB（想定）

---

## ディレクトリ構成

frontend/
├─ src/
│ ├─ app/
│ │ ├─ login/
│ │ ├─ signup/
│ │ ├─ notes/
│ │ │ ├─ create/
│ │ │ ├─ [noteId]/
│ │ │ ├─ NoteTreeItem.tsx
│ │ │ ├─ page.tsx
│ │ ├─ layout.tsx
│ │ ├─ ProtectedLayout.tsx
│ │ ├─ RootLayout.tsx
│ ├─ components/
│ │ ├─ layout/
│ │ ├─ notes/
│ ├─ hooks/
│ │ ├─ useAuthContext.tsx
│ │ ├─ useNotesData.tsx
│ ├─ services/
│ │ ├─ noteService.ts
│ ├─ types.ts
│ ├─ firebase.ts
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js

yaml
Copy code

---

## インストールとセットアップ

### 前提条件

- Node.js >= 20
- npm >= 9
- MongoDB バックエンド API（`http://localhost:5000/api/notes`）
- Firebase プロジェクト（Authentication 用）

### インストール手順

1. リポジトリをクローン

```bash
git clone <your-repo-url>
cd frontend
依存関係をインストール

bash
Copy code
npm install
環境変数を設定（.env.local）

env
Copy code
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
開発サーバーを起動

bash
Copy code
npm run dev
ブラウザで http://localhost:3000 を開きます。

使用方法
ノートの作成
ホーム画面またはサイドバーの「Create Note」ボタンをクリック

タイトルやタグを入力して保存（楽観的更新で即時反映）

ノートの編集
サイドバーでノートを選択

タイトル、タグ、内容を編集

変更は即時バックエンドに反映

ノートの削除
ノート詳細画面の削除ボタンをクリック

削除後、次のノートまたはホーム画面に自動遷移

階層管理
サイドバーで親ノートを選択

「+」アイコンで子ノートを作成

ツリーの折りたたみ・展開が可能

Firebase 認証
認証状態は AuthProvider + useAuthContext で管理

保護されたページは AuthGuard でラップ

Email/Password による新規登録・ログインが可能

TipTap エディタ
@tiptap/react + @tiptap/starter-kit を使用

以下をサポート:

太字、斜体、リンク

コードブロック

Markdown への変換（prosemirror-markdown）

開発用スクリプト
コマンド	説明
npm run dev	開発サーバー起動
npm run build	本番ビルド作成
npm run start	本番サーバー起動
npm run lint	ESLint 実行

既知の課題 / TODO
Next.js 開発環境で ChunkLoadError が出る場合あり（.next を削除して再ビルドで改善可能）

サイドバー選択のリアルタイム同期の改善

API URL がハードコードされている（環境変数化推奨）

単体・統合テストの追加

ライセンス
MIT License
```
