// /notes/page.tsx
"use client";

import { useAuth } from "../../hooks/useAuth";

export default function NotesPage() {
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Notes Page</h1>
      <p>Welcome, UID: {user.uid}</p> {/* Firebase UIDでユーザー識別 */}
    </div>
  );
}
