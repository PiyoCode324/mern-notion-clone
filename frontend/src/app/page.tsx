// frontend/src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">Welcome to Notes App</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Next.js + TailwindCSS + Firebase Auth
      </p>
    </main>
  );
}
