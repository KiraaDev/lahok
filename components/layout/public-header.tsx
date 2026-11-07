
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">lahok.</span>
          <span className="rounded-md border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            OPEN SOURCE
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </Link>
        </nav>

        <Button size="sm">
          <Link href="/auth/login">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}
