import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  ScanLine,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatEventTime } from "@/lib/format";
import { formatListName } from "@/lib/participant-utils";
import {
  EventRegistrations,
} from "@/components/events/event-registrations";
import { RegistrationsSkeleton } from "@/components/events/registrations-skeleton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event, error: eventError }, { data: attendance }] =
    await Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase
        .from("attendance")
        .select(
          `
          id,
          checked_in_at,
          registration:registrations (
            participant:participants (
              id,
              first_name,
              middle_name,
              last_name,
              zone
            )
          )
        `
        )
        .eq("event_id", id)
        .order("checked_in_at", { ascending: false }),
    ]);

  if (eventError || !event) {
    notFound();
  }

  const attendees = attendance ?? [];

  return (
    <main className="mx-auto space-y-8 p-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/events"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to events
        </Link>

        <Link
          href={`/staff/check-in?eventId=${event.id}`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <ScanLine className="mr-2 size-4" />
          Open Scanner
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-xl bg-muted border">
        {event.banner_url ? (
          <Image
            src={event.banner_url}
            alt={`${event.title} Banner`}
            fill
            className="object-cover"
            priority
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-emerald-600 to-cyan-600">
            <span className="text-3xl font-extrabold tracking-tight text-white opacity-40 uppercase">
              {event.title}
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <section className="space-y-3 rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
          {event.status && (
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize">
              {event.status}
            </span>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
          {event.starts_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatEventTime(event.starts_at)}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {event.location}
            </span>
          )}
        </div>
      </section>

      {/* Registrations */}
      <Suspense fallback={<RegistrationsSkeleton />}>
        <EventRegistrations eventId={event.id} />
      </Suspense>

      {/* Attendance List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Attendance</h2>
          <span className="text-sm text-muted-foreground">
            {attendees.length} checked in
          </span>
        </div>

        {attendees.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No participants have checked in yet.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {attendees.map((entry) => {
              const reg = Array.isArray(entry.registration)
                ? entry.registration[0]
                : entry.registration;
              const person = Array.isArray(reg?.participant)
                ? reg.participant[0]
                : reg?.participant;

              if (!person) return null;

              return (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {formatListName(person)}
                    </p>
                    {person.zone && (
                      <p className="truncate text-xs text-muted-foreground">
                        {person.zone}
                      </p>
                    )}
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                    <CheckCircle2 className="size-4" />
                    {formatEventTime(entry.checked_in_at)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}