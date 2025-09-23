// frontend/src/app/components/layout/Header.tsx
"use client"; // ← これで Client Component になる

import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const Header: React.FC = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ログアウト後は useAuth が自動で /login にリダイレクトします
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Notes App</h1>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm">UID: {user.uid}</span>
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </>
        ) : (
          <span className="text-sm">Not logged in</span>
        )}
      </div>
    </header>
  );
};

export default Header;
