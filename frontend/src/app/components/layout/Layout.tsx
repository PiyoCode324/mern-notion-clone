// frontend/src/app/components/layout/Layout.tsx
"use client";

import React, { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const hideLayout =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/reset-password");

  if (hideLayout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-200">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-200">
      <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
      <div className="flex flex-1 overflow-hidden">
        {/* モバイル用オーバーレイ */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static z-40 transition-transform transform h-full bg-gray-50 dark:bg-[#1f1f1f] border-r border-gray-200 dark:border-gray-800 
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 w-64`}
        >
          <Sidebar onSelect={() => setIsSidebarOpen(false)} />
        </aside>

        {/* Main content */}
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};

export default Layout;
