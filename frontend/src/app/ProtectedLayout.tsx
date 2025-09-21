// frontend/src/app/ProtectedLayout.tsx
import { ReactNode } from "react";
import { AuthGuard } from "./components/AuthGuard";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
