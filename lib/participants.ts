import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getTodayKey } from "@/lib/calendar";
import { birthdateBounds } from "@/lib/participant-utils";
import {
  AGE_GROUPS,
  PARTICIPANT_PAGE_SIZE,
  SEXES,
  type AgeGroup,
  type ParticipantListItem,
  type ParticipantRecord,
} from "@/types/participant";

const LIST_COLUMNS =
  "id, first_name, middle_name, last_name, birthdate, sex, zone, contact_number, qr_token";

type Filters = {
  q?: string;
  sex?: string;
  ageGroup?: string;
  page?: number;
};

export type ParticipantsPage = {
  items: ParticipantListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function getParticipants({
  q,
  sex,
  ageGroup,
  page = 1,
}: Filters = {}): Promise<ParticipantsPage> {
  const supabase = await createClient();

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const from = (safePage - 1) * PARTICIPANT_PAGE_SIZE;
  const to = from + PARTICIPANT_PAGE_SIZE - 1;

  let query = supabase
    .from("participants")
    .select(LIST_COLUMNS, { count: "exact" })
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .range(from, to);

  const terms = (q ?? "")
    .replace(/[%,()*\\"]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);

  for (const term of terms) {
    query = query.or(
      `first_name.ilike."%${term}%",middle_name.ilike."%${term}%",last_name.ilike."%${term}%",zone.ilike."%${term}%"`
    );
  }

  if (sex && (SEXES as readonly string[]).includes(sex)) {
    query = query.eq("sex", sex as "male" | "female");
  }

  if (ageGroup && (AGE_GROUPS as readonly string[]).includes(ageGroup)) {
    const { onOrBefore, after } = birthdateBounds(ageGroup as AgeGroup, getTodayKey());
    query = query.lte("birthdate", onOrBefore);
    if (after) query = query.gt("birthdate", after);
  }

  const { data, error, count } = await query;

  if (error) {
    if (error.code === "PGRST103") {
      return {
        items: [],
        total: 0,
        page: safePage,
        pageSize: PARTICIPANT_PAGE_SIZE,
        pageCount: 1,
      };
    }
    throw new Error("Could not load participants.");
  }

  const total = count ?? 0;

  return {
    items: (data ?? []) as ParticipantListItem[],
    total,
    page: safePage,
    pageSize: PARTICIPANT_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PARTICIPANT_PAGE_SIZE)),
  };
}

export async function getParticipantById(id: string): Promise<ParticipantRecord | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  return data as ParticipantRecord | null;
}