// frontend/src/app/login/page.tsx
"use client";

import { AuthForm } from "../components/AuthForm";

export default function LoginPage() {
  return <AuthForm isLogin={true} />;
}
