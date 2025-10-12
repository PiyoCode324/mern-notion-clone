// frontend/src/app/components/layout/MainContent.tsx
import React, { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto px-12 py-8 bg-white dark:bg-[#1f1f1f] rounded-tl-2xl shadow-inner">
      {children}
    </main>
  );
};

export default MainContent;
