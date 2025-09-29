// frontend/src/app/notes/page.tsx
"use client";

import Link from "next/link";

export default function NotesHomePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome to My Notion Clone</h1>
      <p className="mb-4">
        Select a note from the sidebar or create a new one.
      </p>
      <Link
        href="/notes/create"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        ➕ Create Note
      </Link>
    </div>
  );
}
