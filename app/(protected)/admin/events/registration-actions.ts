"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  MAX_REGISTRATIONS_PER_ADD,
  type AvailableParticipant,
} from "@/types/registration";

type SearchResult =
  | { ok: true; results: AvailableParticipant[] }
  | { ok: false; error: string };
type AddResult = { ok: true; added: number } | { ok: false; error: string };
type Result = { ok: true } | { ok: false; error: string };

const NO_PERMISSION = "You don't have permission to do that.";
const idSchema = z.uuid();

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function searchParticipantsForEvent(
  eventId: string,
  q: string
): Promise<SearchResult> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(eventId).success) return { ok: false, error: "Event not found." };

  const supabase = await createClient();

  let query = supabase
    .from("participants")
    .select("id, first_name, middle_name, last_name, birthdate, sex, zone")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(20);

  const terms = String(q ?? "")
    .replace(/[%,()*\\"]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5);

  for (const term of terms) {
    query = query.or(
      `first_name.ilike."%${term}%",middle_name.ilike."%${term}%",last_name.ilike."%${term}%",zone.ilike."%${term}%"`
    );
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: "Could not search participants." };

  const people = data ?? [];
  const registered = new Set<string>();

  if (people.length > 0) {
    const { data: existing, error: existingError } = await supabase
      .from("registrations")
      .select("participant_id")
      .eq("event_id", eventId)
      .in("participant_id", people.map((p) => p.id));

    if (existingError) return { ok: false, error: "Could not search participants." };
    for (const row of existing ?? []) registered.add(row.participant_id);
  }

  return {
    ok: true,
    results: people.map((p) => ({
      id: p.id,
      first_name: p.first_name,
      middle_name: p.middle_name,
      last_name: p.last_name,
      birthdate: p.birthdate,
      sex: p.sex as "male" | "female",
      zone: p.zone,
      registered: registered.has(p.id),
    })),
  };
}

export async function addRegistrations(
  eventId: string,
  participantIds: string[]
): Promise<AddResult> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(eventId).success) return { ok: false, error: "Event not found." };

  const parsed = z
    .array(z.uuid())
    .min(1, "Select at least one person.")
    .max(MAX_REGISTRATIONS_PER_ADD, `Add up to ${MAX_REGISTRATIONS_PER_ADD} people at a time.`)
    .safeParse(participantIds);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid selection." };
  }

  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return { ok: false, error: "Event not found." };

  const rows = Array.from(new Set(parsed.data)).map((participant_id) => ({
    event_id: eventId,
    participant_id,
  }));

  const { data, error } = await supabase
    .from("registrations")
    .upsert(rows, { onConflict: "event_id,participant_id", ignoreDuplicates: true })
    .select("id");

  if (error) {
    if (error.code === "23503") {
      return { ok: false, error: "One or more participants no longer exist." };
    }
    return { ok: false, error: "Could not add registrations. Please try again." };
  }

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true, added: data?.length ?? 0 };
}

export async function removeRegistration(
  eventId: string,
  registrationId: string
): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(eventId).success || !idSchema.safeParse(registrationId).success) {
    return { ok: false, error: "Registration not found." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .delete()
    .eq("id", registrationId)
    .eq("event_id", eventId)
    .select("id");

  if (error) return { ok: false, error: "Could not remove the registration." };
  if (!data?.length) {
    return { ok: false, error: "Registration not found, or you don't have permission." };
  }

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}