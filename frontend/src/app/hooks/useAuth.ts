// frontend/src/app/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User, getIdToken } from "firebase/auth";

interface AuthState {
  user: User | null;
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
      console.log(
        `[useAuth] onAuthStateChanged fired: ${user ? user.uid : "null"}`
      );

      let idToken: string | null = null;

      if (user) {
        try {
          idToken = await getIdToken(user, true);
          console.log("[useAuth] Fresh ID token retrieved successfully.");
        } catch (error) {
          console.error("[useAuth] Error retrieving ID token:", error);
          idToken = null;
        }
      }

      setAuthState({
        user: user as User | null,
        token: idToken,
        loading: false,
      });
    });

    return () => {
      console.log("[useAuth] unsubscribe called");
      unsubscribe();
    };
  }, []);

  return authState;
};