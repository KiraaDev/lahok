import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { EventRecord } from "@/types/event";
import type { RosterEntry } from "@/types/attendance";

export type CheckInEvent = Pick<
  EventRecord,
  "id" | "title" | "starts_at" | "ends_at" | "venue" | "status"
>;

const EVENT_COLUMNS = "id, title, starts_at, ends_at, venue, status";

type RegistrationRow = {
  participant:
    | Omit<RosterEntry, "checked_in_at">
    | Omit<RosterEntry, "checked_in_at">[]
    | null;
};

export async function getCheckInEvents(): Promise<CheckInEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .in("status", ["upcoming", "ongoing"])
    .order("starts_at", { ascending: true })
    .limit(20);

  if (error) throw new Error("Could not load events.");
  return (data ?? []) as CheckInEvent[];
}

export async function getCheckInEvent(
  id: string
): Promise<{ event: CheckInEvent; roster: RosterEntry[] } | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createClient();

  const [eventResult, registrationResult, attendanceResult] = await Promise.all([
    supabase.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle(),
    supabase
      .from("registrations")
      .select("participant:participants(id, first_name, middle_name, last_name, zone)")
      .eq("event_id", id)
      .limit(1000),
    supabase
      .from("attendance")
      .select("participant_id, checked_in_at")
      .eq("event_id", id)
      .limit(1000),
  ]);

  if (eventResult.error || !eventResult.data) return null;
  if (registrationResult.error || attendanceResult.error) {
    throw new Error("Could not load the check-in list.");
  }

  const attended = new Map(
    (attendanceResult.data ?? []).map((row) => [row.participant_id, row.checked_in_at])
  );

  const roster: RosterEntry[] = [];
  for (const row of (registrationResult.data ?? []) as unknown as RegistrationRow[]) {
    const person = Array.isArray(row.participant) ? row.participant[0] : row.participant;
    if (person) roster.push({ ...person, checked_in_at: attended.get(person.id) ?? null });
  }

  roster.sort(
    (a, b) =>
      a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)
  );

  return { event: eventResult.data as CheckInEvent, roster };
}