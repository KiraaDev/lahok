import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EventForm } from "@/components/events/event-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata = {
  title: "New event",
};

export default async function NewEventPage() {
  await requireAdmin();

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
          <h2 className="text-lg font-semibold tracking-tight">New event</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details. You can change everything later.
          </p>
        </div>
      </div>

      <EventForm />
    </div>
  );
}