import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  EVENT_STATUSES,
  type EventRecord,
  type EventStatus,
} from "@/types/event";

export type EventListItem = Pick<
  EventRecord,
  | "id"
  | "title"
  | "slug"
  | "starts_at"
  | "ends_at"
  | "venue"
  | "category"
  | "banner_url"
  | "status"
  | "is_public"
>;

const LIST_COLUMNS =
  "id, title, slug, starts_at, ends_at, venue, category, banner_url, status, is_public";

type Filters = {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  ascending?: boolean;
};

export async function getEvents({
  q,
  status,
  from,
  to,
  ascending = false,
}: Filters = {}): Promise<EventListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select(LIST_COLUMNS)
    .order("starts_at", { ascending })
    .limit(200);

  const search = q?.replace(/[%,()*\\"]/g, " ").trim().slice(0, 100);
  if (search) {
    query = query.or(`title.ilike."%${search}%",venue.ilike."%${search}%"`);
  }

  if (status && (EVENT_STATUSES as readonly string[]).includes(status)) {
    query = query.eq("status", status as EventStatus);
  }

  if (from) query = query.gte("starts_at", from);
  if (to) query = query.lt("starts_at", to);

  const { data, error } = await query;
  if (error) throw new Error("Could not load events.");

  return (data ?? []) as EventListItem[];
}

export async function getEventById(id: string): Promise<EventRecord | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  return data as EventRecord | null;
}