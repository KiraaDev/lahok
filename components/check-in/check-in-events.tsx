import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, ScanLine } from "lucide-react";

import { StatusBadge } from "@/components/events/status-badge";
import { getCheckInEvents } from "@/lib/check-in";
import { formatEventDate } from "@/lib/format";

export async function CheckInEvents() {
  const events = await getCheckInEvents();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <CalendarDays className="size-6 text-muted-foreground" />
        <p className="font-medium">No events to check in.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Events appear here when an admin sets them to Upcoming or Ongoing.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li key={event.id}>
          <Link
            href={`/staff/check-in/${event.id}`}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ScanLine className="size-5" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate font-medium">{event.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {formatEventDate(event.starts_at)}
              </p>
              {event.venue && (
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {event.venue}
                </p>
              )}
            </div>

            <StatusBadge status={event.status} />
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}