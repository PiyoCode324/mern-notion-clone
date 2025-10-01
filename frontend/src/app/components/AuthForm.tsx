// frontend/src/app/components/AuthForm.tsx
"use client";

import { useState } from "react";
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
    console.log("[AuthForm] Submitted:", { email, password, isLogin });

    try {
      let userCredential;

      if (isLogin) {
        console.log("[AuthForm] Trying to login...");
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        console.log("[AuthForm] Trying to sign up...");
        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        console.log("[AuthForm] Backend response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[AuthForm] Backend signup error:", errorData);
          throw new Error(
            errorData.message || "Failed to sign up on the backend."
          );
        }

        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      const token = await userCredential.user.getIdToken();
      console.log("[AuthForm] Firebase token retrieved:", token);

      localStorage.setItem("token", token);
      console.log(
        "[AuthForm] Token saved to localStorage:",
        localStorage.getItem("token")
      );

      window.location.href = "/notes";
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("[AuthForm] Error:", err.message);
        setError(err.message);
      } else {
        console.error("[AuthForm] Unknown error:", err);
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
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
    </form>
  );
};
