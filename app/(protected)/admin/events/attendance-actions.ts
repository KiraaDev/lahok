"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEventAttendance } from "@/lib/attendance";
import { buildAttendanceCsv } from "@/lib/attendance-report";
import { getBranding } from "@/lib/branding";
import { dateKey } from "@/lib/calendar";
import { getEventById } from "@/lib/events";
import { getBarangaySettings } from "@/lib/settings";
import { slugify } from "@/lib/slug";

type ExportResult =
  | { ok: true; filename: string; csv: string }
  | { ok: false; error: string };
type Result = { ok: true } | { ok: false; error: string };

const NO_PERMISSION = "You don't have permission to do that.";
const idSchema = z.uuid();

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export async function exportAttendanceCsv(eventId: string): Promise<ExportResult> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(eventId).success) return { ok: false, error: "Event not found." };

  const event = await getEventById(eventId);
  if (!event) return { ok: false, error: "Event not found." };

  const [rows, settings] = await Promise.all([
    getEventAttendance(eventId),
    getBarangaySettings(),
  ]);

  if (rows.length === 0) {
    return { ok: false, error: "No one is registered for this event." };
  }

  const branding = getBranding(settings);
  const location = [settings.municipality_city, settings.province].filter(Boolean).join(", ");
  const headerLines = branding.isConfigured
    ? [`Sangguniang Kabataan of ${branding.name}`, ...(location ? [location] : [])]
    : [];

  const csv = buildAttendanceCsv({ event, headerLines, rows });
  const filename = `${slugify(event.title) || "event"}-attendance-${dateKey(event.starts_at)}.csv`;

  return { ok: true, filename, csv };
}

export async function undoCheckIn(eventId: string, participantId: string): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(eventId).success || !idSchema.safeParse(participantId).success) {
    return { ok: false, error: "Check-in not found." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("attendance")
    .delete()
    .eq("event_id", eventId)
    .eq("participant_id", participantId)
    .select("id");

  if (error) return { ok: false, error: "Could not undo the check-in. Please try again." };
  if (!data?.length) return { ok: false, error: "Check-in not found." };

  revalidatePath(`/admin/events/${eventId}`);
  return { ok: true };
}