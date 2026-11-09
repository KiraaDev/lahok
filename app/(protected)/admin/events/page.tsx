import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  List,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventsTable } from "@/components/events/events-table";
import { EventsCalendar } from "@/components/events/events-calendar";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getEvents } from "@/lib/events";
import {
  getTodayKey,
  monthRange,
  resolveMonth,
  shiftMonth,
} from "@/lib/calendar";
import { formatMonthTitle } from "@/lib/format";
import { EVENT_STATUSES, STATUS_LABELS } from "@/types/event";
import { connection } from "next/server";

export const metadata = {
  title: "Events",
};

type SearchParams = Promise<{
  q?: string | string[];
  status?: string | string[];
  view?: string | string[];
  month?: string | string[];
}>;

type View = "table" | "calendar";

type Current = { view: View; month: string; status: string; q: string };

const first = (value?: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

const FILTERS = [
  { label: "All", value: "" },
  ...EVENT_STATUSES.map((s) => ({
    label: STATUS_LABELS[s],
    value: s as string,
  })),
];

function buildHref(p: Current) {
  const next = new URLSearchParams();
  if (p.q) next.set("q", p.q);
  if (p.status) next.set("status", p.status);
  if (p.view === "calendar") {
    next.set("view", "calendar");
    next.set("month", p.month);
  }
  const qs = next.toString();
  return qs ? `/admin/events?${qs}` : "/admin/events";
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await connection();
  await requireAdmin();

  const params = await searchParams;
  const q = first(params.q).trim();
  const rawStatus = first(params.status);
  const status = (EVENT_STATUSES as readonly string[]).includes(rawStatus)
    ? rawStatus
    : "";
  const view: View = first(params.view) === "calendar" ? "calendar" : "table";

  const todayKey = getTodayKey();
  const {
    year,
    month,
    value: monthValue,
  } = resolveMonth(first(params.month), todayKey);

  const events =
    view === "calendar"
      ? await getEvents({
          q,
          status,
          ascending: true,
          ...monthRange(year, month),
        })
      : await getEvents({ q, status });

  const current: Current = { view, month: monthValue, status, q };
  const hasFilters = Boolean(q || status);

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Manage your events and their visibility on the public page.
        </p>
        <Link href="/admin/events/new" className={cn(buttonVariants())}>
          <CalendarPlus className="size-4" />
          New event
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form action="/admin/events" className="flex w-full max-w-md gap-2">
            {status && <input type="hidden" name="status" value={status} />}
            {view === "calendar" && (
              <>
                <input type="hidden" name="view" value="calendar" />
                <input type="hidden" name="month" value={monthValue} />
              </>
            )}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search by title or venue"
                className="pl-9"
                aria-label="Search events"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          <div
            className="inline-flex rounded-lg border p-0.5"
            role="group"
            aria-label="Change view"
          >
            <Link
              href={buildHref({ ...current, view: "table" })}
              aria-current={view === "table" ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: view === "table" ? "default" : "ghost",
                  size: "sm",
                }),
              )}
            >
              <List className="size-4" />
              Table
            </Link>
            <Link
              href={buildHref({ ...current, view: "calendar" })}
              aria-current={view === "calendar" ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: view === "calendar" ? "default" : "ghost",
                  size: "sm",
                }),
              )}
            >
              <CalendarDays className="size-4" />
              Calendar
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.value || "all"}
              href={buildHref({ ...current, status: f.value })}
              className={cn(
                buttonVariants({
                  variant: status === f.value ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {view === "calendar" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold">
              {formatMonthTitle(year, month)}
            </h3>

            <div className="flex items-center gap-2">
              <Link
                href={buildHref({ ...current, month: todayKey.slice(0, 7) })}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                Today
              </Link>
              <Link
                href={buildHref({
                  ...current,
                  month: shiftMonth(monthValue, -1),
                })}
                aria-label="Previous month"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                )}
              >
                <ChevronLeft className="size-4" />
              </Link>
              <Link
                href={buildHref({
                  ...current,
                  month: shiftMonth(monthValue, 1),
                })}
                aria-label="Next month"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                )}
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          <EventsCalendar
            events={events}
            year={year}
            month={month}
            todayKey={todayKey}
          />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">
            {hasFilters ? "No events match your search." : "No events yet."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {hasFilters
              ? "Try a different search or clear the filters."
              : "Create your first event to start registering youth and tracking attendance."}
          </p>
          {hasFilters ? (
            <Link
              href="/admin/events"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Clear filters
            </Link>
          ) : (
            <Link href="/admin/events/new" className={cn(buttonVariants())}>
              <CalendarPlus className="size-4" />
              New event
            </Link>
          )}
        </div>
      ) : (
        <EventsTable events={events} todayKey={todayKey} />
      )}
    </div>
  );
}
