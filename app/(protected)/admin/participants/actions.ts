"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  participantSchema,
  type ParticipantData,
} from "@/lib/validations/participant";

type Result = { ok: true } | { ok: false; error: string };

const NO_PERMISSION = "You don't have permission to do that.";
const DUPLICATE = "This person is already registered.";
const idSchema = z.uuid();

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

function refresh() {
  revalidatePath("/admin/participants");
}

export async function createParticipant(values: ParticipantData): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };

  const parsed = participantSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("participants").insert(parsed.data);

  if (error) {
    if (error.code === "23505") return { ok: false, error: DUPLICATE };
    return { ok: false, error: "Could not add the participant. Please try again." };
  }

  refresh();
  return { ok: true };
}

export async function updateParticipant(
  id: string,
  values: ParticipantData
): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Participant not found." };

  const parsed = participantSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .update(parsed.data)
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "23505") return { ok: false, error: DUPLICATE };
    return { ok: false, error: "Could not save changes. Please try again." };
  }
  if (!data?.length) {
    return { ok: false, error: "Participant not found, or you don't have permission." };
  }

  refresh();
  return { ok: true };
}

export async function deleteParticipant(id: string): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Participant not found." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "23503") {
      return { ok: false, error: "This participant has linked records and cannot be deleted." };
    }
    return { ok: false, error: "Could not delete the participant. Please try again." };
  }
  if (!data?.length) {
    return { ok: false, error: "Participant not found, or you don't have permission." };
  }

  refresh();
  return { ok: true };
}