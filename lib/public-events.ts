import { cacheLife, cacheTag } from "next/cache";
import type { PublicEvent } from "@/types/event";
import { createPublicClient } from "./supabase/public";

const COLUMNS =
  "id, title, slug, description, starts_at, ends_at, venue, category, banner_url, status";

const SLUG_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function anonClient() {
  return createPublicClient();
}

export async function getPublicEvents(limit = 6): Promise<PublicEvent[]> {
  "use cache";
  cacheTag("public-events");
  cacheLife("minutes");

  const { data, error } = await anonClient()
    .from("events")
    .select(COLUMNS)
    .eq("is_public", true)
    .in("status", ["upcoming", "ongoing"])
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as PublicEvent[];
}

export async function getPublicEventList(): Promise<PublicEvent[]> {
  return getPublicEvents(100);
}

export async function getPublicEventBySlug(
  slug: string,
): Promise<PublicEvent | null> {
  if (slug.length > 100 || !SLUG_FORMAT.test(slug)) return null;
  return fetchEventBySlug(slug);
}

async function fetchEventBySlug(slug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheTag("public-events");
  cacheLife("minutes");

  const { data, error } = await anonClient()
    .from("events")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("is_public", true)
    .in("status", ["upcoming", "ongoing"])
    .maybeSingle();

  if (error) return null;
  return data as PublicEvent | null;
}
