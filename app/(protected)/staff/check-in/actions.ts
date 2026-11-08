"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { parseQrValue } from "@/lib/qr";
import type { CheckInResult } from "@/types/attendance";

type Response = { ok: true; result: CheckInResult } | { ok: false; error: string };

const idSchema = z.uuid();

const resultSchema = z.object({
  status: z.enum([
    "checked_in",
    "already_checked_in",
    "not_registered",
    "event_closed",
    "event_not_found",
    "participant_not_found",
    "forbidden",
  ]),
  participant: z
    .object({
      id: z.string(),
      first_name: z.string(),
      middle_name: z.string().nullable(),
      last_name: z.string(),
      zone: z.string().nullable(),
    })
    .nullish(),
  checked_in_at: z.string().nullish(),
});

async function isStaff() {
  const user = await getCurrentUser();
  return user?.role === "staff" || user?.role === "admin";
}

async function runCheckIn(eventId: string, participantId: string): Promise<Response> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_in_participant", {
    p_event_id: eventId,
    p_participant_id: participantId,
  });

  if (error) return { ok: false, error: "Could not check in. Please try again." };

  const parsed = resultSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: "Unexpected response. Please try again." };

  return {
    ok: true,
    result: {
      status: parsed.data.status,
      participant: parsed.data.participant ?? null,
      checked_in_at: parsed.data.checked_in_at ?? null,
    },
  };
}

export async function checkIn(eventId: string, scanned: string): Promise<Response> {
  if (!(await isStaff())) return { ok: false, error: "You don't have permission to do that." };
  if (!idSchema.safeParse(eventId).success) return { ok: false, error: "Event not found." };

  const token = parseQrValue(String(scanned ?? "").slice(0, 200));
  if (!token) {
    return { ok: true, result: { status: "unknown_code", participant: null, checked_in_at: null } };
  }

  const supabase = await createClient();
  const { data: participant, error } = await supabase
    .from("participants")
    .select("id")
    .eq("qr_token", token)
    .maybeSingle();

  if (error) return { ok: false, error: "Could not check in. Please try again." };
  if (!participant) {
    return { ok: true, result: { status: "unknown_code", participant: null, checked_in_at: null } };
  }

  return runCheckIn(eventId, participant.id);
}

export async function checkInManual(
  eventId: string,
  participantId: string
): Promise<Response> {
  if (!(await isStaff())) return { ok: false, error: "You don't have permission to do that." };
  if (!idSchema.safeParse(eventId).success || !idSchema.safeParse(participantId).success) {
    return { ok: false, error: "Participant not found." };
  }

  return runCheckIn(eventId, participantId);
}