// components/user-menu.tsx
"use client";

import { useTransition } from "react";
import { ChevronsUpDown, Loader2, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/auth/login/actions";

type Props = { fullName: string | null; email: string; role: string };

function initials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

export function UserMenu({ fullName, email, role }: Props) {
  const [pending, startTransition] = useTransition();
  const displayName = fullName || email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="flex items-center gap-2 rounded-lg p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:pr-2"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(fullName, email)}
          </AvatarFallback>
        </Avatar>

        <div className="hidden min-w-0 text-left leading-tight md:block">
          <p className="max-w-32 truncate text-sm font-medium">{displayName}</p>
          <p className="text-xs capitalize text-muted-foreground">{role}</p>
        </div>

        <ChevronsUpDown className="hidden size-4 text-muted-foreground md:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {/* A plain div, not DropdownMenuLabel, so no group context is needed */}
        <div className="px-2 py-2">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={pending}
          className="text-destructive focus:text-destructive"
          onClick={() =>
            startTransition(async () => {
              await logout();
            })
          }
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          {pending ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}