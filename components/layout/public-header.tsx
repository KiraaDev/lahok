import { Suspense } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { AuthButton, AuthButtonSkeleton } from "@/components/public/auth-button";

type Props = {
  name: string;
  subtitle: string;
  logoUrl: string | null;
  hasAbout: boolean;
  hasContact: boolean;
};

export function PublicHeader({ name, subtitle, logoUrl, hasAbout, hasContact }: Props) {
  const links = [
    { label: "Events", href: "/events" },
    ...(hasAbout ? [{ label: "About", href: "/#about" }] : []),
    ...(hasContact ? [{ label: "Contact", href: "/#contact" }] : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Avatar className="size-9 rounded-lg">
            {logoUrl && <AvatarImage src={logoUrl} alt="" className="object-contain" />}
            <AvatarFallback className="rounded-lg bg-primary font-semibold text-primary-foreground">
              {name.trim().charAt(0).toUpperCase() || "L"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="md:ml-2">
            <Suspense fallback={<AuthButtonSkeleton />}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}