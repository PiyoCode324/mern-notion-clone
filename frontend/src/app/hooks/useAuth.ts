// frontend/src/hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ユーザーがログインしている場合
        setUser(firebaseUser);
        try {
          // 強制的に最新のIDトークンを取得
          const idToken = await firebaseUser.getIdToken(true);
          setToken(idToken);
        } catch (error) {
          console.error("Failed to get fresh token:", error);
          setToken(null);
        }
      } else {
        // ユーザーが未ログインの場合
        setUser(null);
        setToken(null);
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return { user, loading, token };
};
