import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Pencil,
  ScanLine,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatEventTime } from "@/lib/format";
import { EventRegistrations } from "@/components/events/event-registrations";
import { RegistrationsSkeleton } from "@/components/events/registrations-skeleton";
import { AttendanceSkeleton } from "@/components/events/attendance-skeleton";
import { EventAttendance } from "@/components/events/event-attendance";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event, error: eventError }] =
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
        `,
        )
        .eq("event_id", id)
        .order("checked_in_at", { ascending: false }),
    ]);

  if (eventError || !event) {
    notFound();
  }

  return (
    <main className="mx-auto space-y-8 p-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/events"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2",
          )}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to events
        </Link>

        <div>
          <Link
            href={`/staff/check-in?eventId=${event.id}`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <ScanLine className="mr-2 size-4" />
            Open Scanner
          </Link>
          <Link
            href={`/admin/events/${event.id}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Pencil className="mr-2 size-4" />
            Edit Event
          </Link>
        </div>
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

      <Suspense fallback={<AttendanceSkeleton />}>
        <EventAttendance eventId={event.id} eventStatus={event.status} />
      </Suspense>

      {/* Registrations */}
      <Suspense fallback={<RegistrationsSkeleton />}>
        <EventRegistrations eventId={event.id} />
      </Suspense>


    </main>
  );
}
