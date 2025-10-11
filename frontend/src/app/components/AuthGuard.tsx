// frontend/src/app/components/AuthGuard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "../hooks/useAuthContext";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // 🔽 ログインページはガードをスキップ
    if (pathname === "/login") return;

    if (!user) {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) return null;

  // 🔽 ログインページはガード対象外にする
  if (pathname === "/login") return <>{children}</>;

  if (!user) return null;

  return <>{children}</>;
};
