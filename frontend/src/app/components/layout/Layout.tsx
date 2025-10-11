// frontend/src/app/components/layout/Layout.tsx
"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // ログイン・サインアップページなどではヘッダーとサイドバーを非表示
  const hideLayout =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/reset-password");

  if (hideLayout) {
    // 認証前ページではシンプルに children だけ表示
    return (
      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    );
  }

  // 通常ページはヘッダー＆サイドバー付きレイアウト
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};

export default Layout;
