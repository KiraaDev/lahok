"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/user-menu";
import { UserRole } from "@/types/profile";

type Props = {
  titles: Record<string, string>;
  section?: UserRole;
  fullName: string | null;
  email: string;
  role: string;
};

export function AppHeader({ titles, section, ...user }: Props) {
  const pathname = usePathname();

  const title =
    titles[pathname] ??
    Object.entries(titles)
      .filter(([path]) => pathname.startsWith(`${path}/`))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
    "Lahok";

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1 text-muted-foreground" />
      <Separator orientation="vertical" className="h-5" />

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        {section && (
          <>
            <span className="hidden text-muted-foreground sm:inline">{section}</span>
            <span className="hidden text-muted-foreground/40 sm:inline">/</span>
          </>
        )}
        <h1 className="truncate font-semibold tracking-tight">{title}</h1>
      </nav>

      <div className="ml-auto">
        <UserMenu {...user} />
      </div>
    </header>
  );
}