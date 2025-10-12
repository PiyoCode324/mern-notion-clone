// frontend/src/app/components/layout/Header.tsx
"use client";

import React from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthContext();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f1f1f]">
      {/* モバイルメニューアイコン */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          🗒️ My Notes
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user.email || "Logged in"}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Not logged in
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
