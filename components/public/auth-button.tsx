import Link from "next/link";
import { connection } from "next/server";
import { LayoutDashboard, LogIn } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function AuthButton() {
  await connection();

  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <LogIn className="size-4" />
        Officials login
      </Link>
    );
  }

  const href = user.role === "admin" ? "/admin/dashboard" : "/staff/dashboard";

  return (
    <Link href={href} className={cn(buttonVariants({ size: "sm" }))}>
      <LayoutDashboard className="size-4" />
      Go to dashboard
    </Link>
  );
}

export function AuthButtonSkeleton() {
  return <Skeleton className="h-8 w-36 rounded-md" />;
}