import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CheckInConsole } from "@/components/check-in/check-in-console";
import { requireStaff } from "@/lib/auth/require-staff";
import { getCheckInEvent } from "@/lib/check-in";
import { formatEventDate } from "@/lib/format";

export const metadata = {
  title: "Check-in",
};

type Props = { params: Promise<{ eventId: string }> };

export default async function CheckInEventPage({ params }: Props) {
  await requireStaff();

  const { eventId } = await params;
  const data = await getCheckInEvent(eventId);
  if (!data) notFound();

  const { event, roster } = data;
  if (event.status !== "upcoming" && event.status !== "ongoing") {
    redirect("/staff/check-in");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/staff/check-in"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          <ArrowLeft className="size-4" />
          Events
        </Link>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{event.title}</h2>
          <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
            <span>{formatEventDate(event.starts_at)}</span>
            {event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {event.venue}
              </span>
            )}
          </p>
        </div>
      </div>

      <CheckInConsole eventId={event.id} initialRoster={roster} />
    </div>
  );
}