import Link from "next/link";
import { ArrowRight, CalendarDays, Users, ClipboardList, Code2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/layout/public-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative flex flex-1 items-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(128,128,128,0.10),transparent_60%)]" />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
            <div className="max-w-2xl">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Open-source community platform
              </div>

              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                Better events.
                <br />
                <span className="text-muted-foreground">
                  Stronger communities.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                Lahok is an open-source event management platform built for
                Sangguniang Kabataan. Organize activities, manage participants,
                and bring your community together.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/auth/login">
                  <Button size="lg">
                    Get Started
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>

                <Link
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline">
                    <Code2 className="mr-2 size-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>

              <p className="mt-8 text-xs text-muted-foreground">
                Built for local communities. Open for everyone.
              </p>
            </div>

            {/* Feature preview */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-4 rounded-3xl bg-muted/50 blur-2xl" />

              <div className="relative rounded-2xl border bg-card p-5 shadow-xl sm:p-7">
                <div className="flex items-center justify-between border-b pb-5">
                  <div>
                    <p className="text-sm font-semibold">Community Dashboard</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your events, organized.
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <CalendarDays className="size-5 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-5">
                  <div className="rounded-xl border p-4">
                    <CalendarDays className="mb-3 size-5 text-muted-foreground" />
                    <p className="text-2xl font-bold">Events</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Activity management
                    </p>
                  </div>

                  <div className="rounded-xl border p-4">
                    <Users className="mb-3 size-5 text-muted-foreground" />
                    <p className="text-2xl font-bold">People</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Participant management
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <ClipboardList className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Event Management</p>
                      <p className="text-xs text-muted-foreground">
                        Plan, organize, and track activities
                      </p>
                    </div>
                    <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    Powered by Lahok
                  </span>
                  <span className="text-xs font-medium">Community first.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
