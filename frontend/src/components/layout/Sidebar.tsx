// frontend/src/components/layout/Sidebar.tsx
import React from "react";
import Link from "next/link";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 h-full p-4 overflow-y-auto">
      <nav className="flex flex-col space-y-3">
        <Link href="/" className="hover:underline">
          Notes
        </Link>
        <Link href="/create" className="hover:underline">
          Create Note
        </Link>
        <Link href="/profile" className="hover:underline">
          Profile
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
