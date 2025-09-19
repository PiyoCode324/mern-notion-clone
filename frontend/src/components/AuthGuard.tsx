// frontend/src/components/AuthGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) {
      return;
    }

    // ユーザーが認証されていない場合は、ログインページにリダイレクトする
    if (!user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // ローディング中は画面のちらつきを防ぐため何も表示しない
  if (loading) {
    return null;
  }

  // ユーザーが認証されていない場合は、リダイレクトが完了するまで何も表示しない
  if (!user) {
    return null;
  }

  // ユーザーが認証されている場合は、子コンポーネントを表示する
  return <>{children}</>;
};
