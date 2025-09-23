// frontend/src/app/components/AuthForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

type AuthFormProps = {
  isLogin: boolean;
};

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let userCredential;

      if (isLogin) {
        // ログイン
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        // サインアップ (バックエンドに登録)
        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to sign up on the backend."
          );
        }

        // Firebase にもサインインして token を取得
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      // ✅ Firebase IDトークンを localStorage に保存
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);

      // ダッシュボードへ
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md space-y-4"
    >
      <h2 className="text-xl font-bold text-center mb-4">
        {isLogin ? "Login" : "Sign Up"}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="••••••••"
          required
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md transition"
      >
        {isLogin ? "Login" : "Sign Up"}
      </button>
    </form>
  );
};
