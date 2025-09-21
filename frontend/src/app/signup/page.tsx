// /signup/page.tsx
"use client";

import { AuthForm } from "../components/AuthForm";

export default function SignUpPage() {
  return <AuthForm isLogin={false} />;
}
