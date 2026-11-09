import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/events/status-badge";
import { buildMonthGrid, dateKey } from "@/lib/calendar";
import { formatDayHeading, formatEventTime } from "@/lib/format";
import type { EventListItem } from "@/lib/events";
import type { EventStatus } from "@/types/event";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_PER_DAY = 3;

const PILL_STYLES: Record<EventStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  upcoming: "bg-primary/10 text-primary",
  ongoing: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  completed: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  cancelled: "bg-red-100 text-red-800 line-through dark:bg-red-950 dark:text-red-300",
};

const DOT_STYLES: Record<EventStatus, string> = {
  draft: "bg-slate-400",
  upcoming: "bg-primary",
  ongoing: "bg-green-500",
  completed: "bg-slate-500",
  cancelled: "bg-red-500",
};

function groupByDay(events: EventListItem[]) {
  const map = new Map<string, EventListItem[]>();
  for (const event of events) {
    const key = dateKey(event.starts_at);
    const list = map.get(key);
    if (list) list.push(event);
    else map.set(key, [event]);
  }
  return map;
}

function BannerCard({ event, url }: { event: EventListItem; url: string }) {
  return (
    <Link
      href={`/admin/events/${event.id}`}
      title={event.title}
      className="group relative block h-16 overflow-hidden rounded-md bg-muted"
    >
      <Image
        src={url}
        alt=""
        fill
        sizes="170px"
        className={cn(
          "object-cover transition-transform group-hover:scale-105",
          event.status === "cancelled" && "grayscale"
        )}
        loading="eager"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <span
        className={cn("absolute right-1 top-1 size-2 rounded-full ring-2 ring-black/30", DOT_STYLES[event.status])}
      />
      <span
        className={cn(
          "absolute inset-x-1 bottom-0.5 truncate text-[11px] font-medium leading-tight text-white",
          event.status === "cancelled" && "line-through"
        )}
      >
        {event.title}
      </span>
    </Link>
  );
}

function Pill({ event }: { event: EventListItem }) {
  return (
    <Link
      href={`/admin/events/${event.id}`}
      title={event.title}
      className={cn(
        "block truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight hover:opacity-80",
        PILL_STYLES[event.status]
      )}
    >
      {formatEventTime(event.starts_at)} {event.title}
    </Link>
  );
}

type Props = {
  events: EventListItem[];
  year: number;
  month: number;
  todayKey: string;
};

export function EventsCalendar({ events, year, month, todayKey }: Props) {
  const weeks = buildMonthGrid(year, month);
  const byDay = groupByDay(events);
  const agendaDays = Array.from(byDay.keys()).sort();

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((cell) => {
              const dayEvents = byDay.get(cell.key) ?? [];
              const shown = dayEvents.slice(0, MAX_PER_DAY);
              const extra = dayEvents.length - shown.length;
              const isToday = cell.key === todayKey;

              return (
                <div
                  key={cell.key}
                  className={cn(
                    "min-h-32 space-y-1 border-r p-1.5 last:border-r-0",
                    !cell.inMonth && "bg-muted/30"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      !cell.inMonth && "text-muted-foreground/50",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {cell.day}
                  </span>

                  {shown.map((event) =>
                    event.banner_url ? (
                      <BannerCard key={event.id} event={event} url={event.banner_url} />
                    ) : (
                      <Pill key={event.id} event={event} />
                    )
                  )}

                  {extra > 0 && (
                    <p className="px-1 text-[11px] text-muted-foreground">+{extra} more</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="space-y-4 md:hidden">
        {agendaDays.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
            <CalendarDays className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No events this month.</p>
          </div>
        ) : (
          agendaDays.map((key) => (
            <section key={key} className="space-y-2">
              <h3
                className={cn(
                  "text-sm font-semibold",
                  key === todayKey ? "text-primary" : "text-foreground"
                )}
              >
                {formatDayHeading(key)}
                {key === todayKey && " · Today"}
              </h3>

              <div className="space-y-2">
                {byDay.get(key)!.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="flex items-center gap-3 rounded-xl border bg-card p-2 hover:bg-muted/40"
                  >
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {event.banner_url ? (
                        <Image
                          src={event.banner_url}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                          loading="eager"
                        />
                      ) : (
                        <CalendarDays className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p
                        className={cn(
                          "truncate text-sm font-medium",
                          event.status === "cancelled" && "line-through"
                        )}
                      >
                        {event.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatEventTime(event.starts_at)}
                        {event.venue ? ` · ${event.venue}` : ""}
                      </p>
                      <StatusBadge status={event.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}