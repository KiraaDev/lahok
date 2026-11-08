import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Globe,
  Radio,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/events/status-badge";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getDashboardData } from "@/lib/dashboard";
import { formatEventDate } from "@/lib/format";

export const metadata = {
  title: "Dashboard",
};

type StatProps = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  href: string;
};

function StatCard({ label, value, hint, icon: Icon, href }: StatProps) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-colors group-hover:bg-muted/40">
        <CardContent className="flex items-start justify-between gap-3 pt-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await requireAdmin();
  const { counts, nextEvents } = await getDashboardData();

  const firstName = user.full_name?.trim().split(/\s+/)[0] ?? null;

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here is what is happening with your events.
          </p>
        </div>
        <Link href="/admin/events/new" className={cn(buttonVariants())}>
          <CalendarPlus className="size-4" />
          New event
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming"
          value={counts.upcoming}
          hint="Scheduled events"
          icon={CalendarClock}
          href="/admin/events?status=upcoming"
        />
        <StatCard
          label="Ongoing"
          value={counts.ongoing}
          hint="Happening now"
          icon={Radio}
          href="/admin/events?status=ongoing"
        />
        <StatCard
          label="This month"
          value={counts.thisMonth}
          hint="Starting this month"
          icon={CalendarRange}
          href="/admin/events?view=calendar"
        />
        <StatCard
          label="On public page"
          value={counts.live}
          hint="Visible to residents"
          icon={Globe}
          href="/admin/events"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-base">Next events</CardTitle>
              <CardDescription>Upcoming and ongoing, soonest first.</CardDescription>
            </div>
            <Link
              href="/admin/events"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all
            </Link>
          </CardHeader>

          <CardContent>
            {nextEvents.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
                <CalendarDays className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium">No upcoming events.</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Create an event to start registering youth and tracking attendance.
                </p>
                <Link href="/admin/events/new" className={cn(buttonVariants({ size: "sm" }))}>
                  <CalendarPlus className="size-4" />
                  New event
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {nextEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="flex items-center gap-3 rounded-lg border p-2 hover:bg-muted/40"
                    >
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        {event.banner_url ? (
                          <Image
                            src={event.banner_url}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <CalendarDays className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{event.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatEventDate(event.starts_at)}
                          {event.venue ? ` · ${event.venue}` : ""}
                        </p>
                      </div>

                      <StatusBadge status={event.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
            <CardDescription>Jump to common tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link
              href="/admin/events/new"
              className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
            >
              <CalendarPlus className="size-4" />
              Create an event
            </Link>
            <Link
              href="/admin/events?view=calendar"
              className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
            >
              <CalendarDays className="size-4" />
              Open the calendar
            </Link>
            <Link
              href="/admin/settings"
              className={cn(buttonVariants({ variant: "outline" }), "justify-start")}
            >
              <Settings className="size-4" />
              Barangay settings
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}