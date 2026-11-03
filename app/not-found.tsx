import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">404</h1>

      <p className="text-muted-foreground">
        This page could not be found.
      </p>

      <Link href="/" className="text-primary underline">
        Go back home
      </Link>
    </main>
  );
}