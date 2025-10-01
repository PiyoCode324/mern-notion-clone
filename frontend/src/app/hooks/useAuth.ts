// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    console.log("[useAuth] useEffect mounted");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[useAuth] onAuthStateChanged fired:", user);
      if (user) {
        const token = await getIdToken(user);
        console.log("[useAuth] Fresh ID token retrieved:", token);
        setAuthState({ user, token, loading: false });
      } else {
        setAuthState({ user: null, token: null, loading: false });
      }
    });

    return () => {
      console.log("[useAuth] unsubscribe called");
      unsubscribe();
    };
  }, []);

  return authState;
};