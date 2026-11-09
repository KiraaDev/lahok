import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getDashboardPath } from "@/lib/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./login-form";
import { getBarangaySettings } from "@/lib/settings";
import { getBranding } from "@/lib/branding";
import Image from "next/image";

export default async function LoginContent() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    redirect(getDashboardPath(currentUser.role));
  }

  const settings = await getBarangaySettings();
  const branding = getBranding(settings);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(128,128,128,0.12),transparent_60%)]" />

      <div className="relative w-full max-w-sm">
        {/* Back to home */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <Card className="border-border/70 shadow-lg shadow-black/5">
          <CardHeader className="space-y-5 text-center">
            <div className="mx-auto flex size-12 items-center justify-center">
              <Image
                src="/icon.svg"
                alt="Lahok logo"
                width={48}
                height={48}
                priority
                fetchPriority="high"
                className="size-12 object-contain"
              />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold tracking-tight">Lahok</p>

              <CardTitle className="text-xl">Welcome back</CardTitle>

              <CardDescription>{branding.loginDescription}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <LoginForm />

            <div className="border-t pt-5">
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Open-source event management for Sangguniang Kabataan.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by Lahok · Built for local communities.
        </p>
      </div>
    </main>
  );
}
