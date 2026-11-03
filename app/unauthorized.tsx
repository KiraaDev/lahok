import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">Access denied</h1>

      <p className="text-muted-foreground">
        You don't have permission to access this page.
      </p>

      <Link href="/" className="text-primary underline">
        Go back home
      </Link>
    </main>
  );
}