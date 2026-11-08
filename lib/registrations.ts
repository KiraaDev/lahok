import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type {
  RegistrationItem,
  RegistrationParticipant,
} from "@/types/registration";

type Row = {
  id: string;
  created_at: string;
  participant: RegistrationParticipant | RegistrationParticipant[] | null;
};

export async function getEventRegistrations(eventId: string): Promise<RegistrationItem[]> {
  if (!z.uuid().safeParse(eventId).success) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, created_at, participant:participants(id, first_name, middle_name, last_name, birthdate, sex, zone)"
    )
    .eq("event_id", eventId)
    .limit(1000);

  if (error) throw new Error("Could not load registrations.");

  const items: RegistrationItem[] = [];
  for (const row of (data ?? []) as unknown as Row[]) {
    const participant = Array.isArray(row.participant) ? row.participant[0] : row.participant;
    if (participant) {
      items.push({ id: row.id, created_at: row.created_at, participant });
    }
  }

  return items.sort(
    (a, b) =>
      a.participant.last_name.localeCompare(b.participant.last_name) ||
      a.participant.first_name.localeCompare(b.participant.first_name)
  );
}