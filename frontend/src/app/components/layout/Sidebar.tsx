// frontend/src/components/layout/Sidebar.tsx
import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 h-full p-4 overflow-y-auto">
      <nav className="flex flex-col space-y-3">
        {/* トップページ */}
        <Link href="/" className="hover:underline">
          Home
        </Link>

        {/* ノート一覧ページ */}
        <Link href="/notes" className="hover:underline">
          Notes
        </Link>

        {/* ノート作成ページ */}
        <Link href="/notes/create" className="hover:underline">
          Create Note
        </Link>

        {/* プロフィール */}
        <Link href="/profile" className="hover:underline">
          Profile
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
