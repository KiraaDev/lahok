import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getTodayKey, monthRange, resolveMonth } from "@/lib/calendar";
import type { EventListItem } from "@/lib/events";

const COLUMNS =
  "id, title, slug, starts_at, ends_at, venue, category, banner_url, status, is_public";

export type DashboardData = {
  counts: {
    upcoming: number;
    ongoing: number;
    thisMonth: number;
    live: number;
  };
  nextEvents: EventListItem[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const { year, month } = resolveMonth(undefined, getTodayKey());
  const { from, to } = monthRange(year, month);

  const count = () =>
    supabase.from("events").select("id", { count: "exact", head: true });

  const [upcoming, ongoing, thisMonth, live, next] = await Promise.all([
    count().eq("status", "upcoming"),
    count().eq("status", "ongoing"),
    count().gte("starts_at", from).lt("starts_at", to),
    count().eq("is_public", true).in("status", ["upcoming", "ongoing"]),
    supabase
      .from("events")
      .select(COLUMNS)
      .in("status", ["upcoming", "ongoing"])
      .order("starts_at", { ascending: true })
      .limit(5),
  ]);

  const failed = [upcoming, ongoing, thisMonth, live, next].some((r) => r.error);
  if (failed) throw new Error("Could not load the dashboard.");

  return {
    counts: {
      upcoming: upcoming.count ?? 0,
      ongoing: ongoing.count ?? 0,
      thisMonth: thisMonth.count ?? 0,
      live: live.count ?? 0,
    },
    nextEvents: (next.data ?? []) as EventListItem[],
  };
}