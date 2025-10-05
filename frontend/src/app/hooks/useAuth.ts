// frontend/src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { auth } from "../firebase"; // 既存のFirebase Authインスタンス
import { onAuthStateChanged, User, getIdToken } from "firebase/auth";

interface AuthState {
  user: User | null; // FirebaseのUser型を使用
  token: string | null;
  loading: boolean; // true: 認証ステータスをチェック中 (未確定) / false: 認証ステータスが確定
}

/**
 * ユーザーの認証状態とIDトークンを取得するカスタムフック
 * @returns {AuthState} 認証状態、トークン、ロード状態
 */
export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true, // 初期状態はロード中
  });

  useEffect(() => {
    console.log("[useAuth] useEffect mounted");

    // onAuthStateChangedリスナーを設定
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        `[useAuth] onAuthStateChanged fired: ${user ? user.uid : "null"}`
      );

      let idToken: string | null = null;

      if (user) {
        try {
          // IDトークンを強制的にリフレッシュして取得 (trueを指定)
          // これにより、最新のトークンが確実に取得されます
          idToken = await getIdToken(user, true);
          // セキュリティのため、トークン自体はログに出力しないようにします
          console.log("[useAuth] Fresh ID token retrieved successfully.");
        } catch (error) {
          console.error("[useAuth] Error retrieving ID token:", error);
          // トークン取得失敗時もuserは存在する可能性があるため、nullを設定
          idToken = null;
        }
      }

      // トークン取得処理が完了したら、ロード状態を解除する。
      // これにより、トークンが null であっても loading が false になるまで、
      // 依存フック (例: NoteDetail.tsx の useEffect) は API コールを待機できます。
      setAuthState({
        user: user as User | null,
        token: idToken,
        loading: false, // 認証ステータスが確定
      });
    });

    // クリーンアップ関数: コンポーネントがアンマウントされたときにリスナーを解除
    return () => {
      console.log("[useAuth] unsubscribe called");
      unsubscribe();
    };
  }, []); // 依存配列が空なので、マウント時とアンマウント時のみ実行

  return authState;
};
