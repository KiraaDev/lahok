import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicEventCard } from "@/components/public/public-event-card";
import { getPublicEventList } from "@/lib/public-events";
import { CATEGORY_LABELS, EVENT_CATEGORIES } from "@/types/event";

export const metadata = {
  title: "Events",
};

type SearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
}>;

const first = (value?: string | string[]) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

function buildHref(q: string, category: string) {
  const next = new URLSearchParams();
  if (q) next.set("q", q);
  if (category) next.set("category", category);
  const qs = next.toString();
  return qs ? `/events?${qs}` : "/events";
}

export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = first(params.q).trim().slice(0, 100);
  const rawCategory = first(params.category);

  const all = await getPublicEventList();

  const presentCategories = EVENT_CATEGORIES.filter((c) =>
    all.some((event) => event.category === c)
  );
  const category = presentCategories.some((c) => c === rawCategory) ? rawCategory : "";

  const needle = q.toLowerCase();
  const events = all.filter((event) => {
    if (category && event.category !== category) return false;
    if (!needle) return true;
    return `${event.title} ${event.venue ?? ""} ${event.description ?? ""}`
      .toLowerCase()
      .includes(needle);
  });

  const hasFilters = Boolean(q || category);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Everything happening now and coming soon in our barangay.
        </p>
      </div>

      <div className="space-y-3">
        <form action="/events" className="flex max-w-md gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search events"
              className="pl-9"
              aria-label="Search events"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {presentCategories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref(q, "")}
              className={cn(
                buttonVariants({ variant: category === "" ? "default" : "outline", size: "sm" })
              )}
            >
              All
            </Link>
            {presentCategories.map((c) => (
              <Link
                key={c}
                href={buildHref(q, c)}
                className={cn(
                  buttonVariants({ variant: category === c ? "default" : "outline", size: "sm" })
                )}
              >
                {CATEGORY_LABELS[c]}
              </Link>
            ))}
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-12 text-center">
          <CalendarDays className="size-8 text-muted-foreground" />
          <p className="font-medium">
            {hasFilters ? "No events match your search." : "No upcoming events right now."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {hasFilters
              ? "Try a different search or clear the filters."
              : "New events will be posted here. Please check back soon."}
          </p>
          {hasFilters && (
            <Link href="/events" className={cn(buttonVariants({ variant: "outline" }))}>
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <PublicEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}