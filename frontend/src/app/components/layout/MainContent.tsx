// frontend/src/app/components/layout/MainContent.tsx
import React, { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <main className="flex-1 p-6 overflow-y-auto bg-background text-foreground">
      {children}
    </main>
  );
};

export default MainContent;
