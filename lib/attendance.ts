import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ParticipantRecord } from "@/types/participant";

export type AttendanceParticipant = Pick<
  ParticipantRecord,
  "id" | "first_name" | "middle_name" | "last_name" | "birthdate" | "sex" | "zone"
>;

export type AttendanceRow = {
  participant: AttendanceParticipant;
  attendance_id: string | null;
  checked_in_at: string | null;
};

type RegistrationRow = {
  participant: AttendanceParticipant | AttendanceParticipant[] | null;
};

export async function getEventAttendance(eventId: string): Promise<AttendanceRow[]> {
  if (!z.uuid().safeParse(eventId).success) return [];

  const supabase = await createClient();

  const [registrations, attendance] = await Promise.all([
    supabase
      .from("registrations")
      .select(
        "participant:participants(id, first_name, middle_name, last_name, birthdate, sex, zone)"
      )
      .eq("event_id", eventId)
      .limit(1000),
    supabase
      .from("attendance")
      .select("id, participant_id, checked_in_at")
      .eq("event_id", eventId)
      .limit(1000),
  ]);

  if (registrations.error || attendance.error) {
    throw new Error("Could not load attendance.");
  }

  const attended = new Map(
    (attendance.data ?? []).map((row) => [
      row.participant_id,
      { id: row.id, at: row.checked_in_at },
    ])
  );

  const rows: AttendanceRow[] = [];
  for (const row of (registrations.data ?? []) as unknown as RegistrationRow[]) {
    const participant = Array.isArray(row.participant) ? row.participant[0] : row.participant;
    if (!participant) continue;

    const entry = attended.get(participant.id);
    rows.push({
      participant,
      attendance_id: entry?.id ?? null,
      checked_in_at: entry?.at ?? null,
    });
  }

  return rows.sort(
    (a, b) =>
      a.participant.last_name.localeCompare(b.participant.last_name) ||
      a.participant.first_name.localeCompare(b.participant.first_name)
  );
}