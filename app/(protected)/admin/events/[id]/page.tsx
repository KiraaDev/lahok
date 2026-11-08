import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EventForm } from "@/components/events/event-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getEventById } from "@/lib/events";

export const metadata = {
  title: "Edit event",
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ banner?: string | string[] }>;
};

export default async function EditEventPage({ params, searchParams }: Props) {
  await requireAdmin();

  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const query = await searchParams;
  const banner = Array.isArray(query.banner) ? query.banner[0] : query.banner;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/events"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
        >
          <ArrowLeft className="size-4" />
          Events
        </Link>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Edit event</h2>
          <p className="truncate text-sm text-muted-foreground">{event.title}</p>
        </div>
      </div>

      {banner === "failed" && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          The event was created, but the banner could not be uploaded. You can try again below.
        </p>
      )}

      <EventForm event={event} />
    </div>
  );
}