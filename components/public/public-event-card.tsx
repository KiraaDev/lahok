import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { StatusBadge } from "@/components/events/status-badge";
import { formatEventDate } from "@/lib/format";
import { CATEGORY_LABELS, type PublicEvent } from "@/types/event";

export function PublicEventCard({ event }: { event: PublicEvent }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/10">
            <CalendarDays className="size-8 text-primary/60" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium text-primary">
          {CATEGORY_LABELS[event.category]}
        </p>
        <h3 className="line-clamp-2 font-semibold leading-snug">{event.title}</h3>

        <div className="mt-auto space-y-1 pt-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            {formatEventDate(event.starts_at)}
          </p>
          {event.venue && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}