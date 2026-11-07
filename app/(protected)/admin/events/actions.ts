"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { eventSchema, type EventData } from "@/lib/validations/event";
import { generateSlug } from "@/lib/slug";
import {
  EVENT_BANNER_BUCKET,
  EVENT_BANNER_MAX_BYTES,
  EVENT_BANNER_TYPES,
} from "@/types/event";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type BannerResult = { ok: true; url: string | null } | { ok: false; error: string };

const NO_PERMISSION = "You don't have permission to do that.";
const idSchema = z.uuid();

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

function bannerPath(url: string | null) {
  const marker = `/${EVENT_BANNER_BUCKET}/`;
  const i = url ? url.indexOf(marker) : -1;
  return url && i >= 0 ? url.slice(i + marker.length) : null;
}

function refresh() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function createEvent(values: EventData): Promise<CreateResult> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };

  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("events")
      .insert({ ...parsed.data, slug: generateSlug(parsed.data.title) })
      .select("id")
      .single();

    if (!error && data) {
      refresh();
      return { ok: true, id: data.id };
    }
    if (error?.code !== "23505") break;
  }

  return { ok: false, error: "Could not create the event. Please try again." };
}

export async function updateEvent(id: string, values: EventData): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Event not found." };

  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: "Could not save the event. Please try again." };
  if (!data?.length) return { ok: false, error: "Event not found, or you don't have permission." };

  refresh();
  return { ok: true };
}

export async function setEventPublic(id: string, isPublic: boolean): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Event not found." };
  if (typeof isPublic !== "boolean") return { ok: false, error: "Invalid value." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .update({ is_public: isPublic })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) return { ok: false, error: "Could not update visibility." };

  refresh();
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<Result> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Event not found." };

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("events")
    .select("banner_url")
    .eq("id", id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: "Could not delete the event. Please try again." };
  if (!data?.length) return { ok: false, error: "Event not found, or you don't have permission." };

  const oldPath = bannerPath(current?.banner_url ?? null);
  if (oldPath) await supabase.storage.from(EVENT_BANNER_BUCKET).remove([oldPath]);

  refresh();
  return { ok: true };
}

export async function uploadEventBanner(eventId: string, formData: FormData): Promise<BannerResult> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(eventId).success) return { ok: false, error: "Event not found." };

  const file = formData.get("banner");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }
  if (file.size > EVENT_BANNER_MAX_BYTES) return { ok: false, error: "Image must be 2 MB or smaller." };

  const ext = EVENT_BANNER_TYPES[file.type];
  if (!ext) return { ok: false, error: "Use a PNG, JPG, or WebP image." };

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("events")
    .select("banner_url")
    .eq("id", eventId)
    .maybeSingle();
  if (!current) return { ok: false, error: "Event not found." };

  const path = `${eventId}/banner-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(EVENT_BANNER_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (uploadError) return { ok: false, error: "Upload failed. Please try again." };

  const url = supabase.storage.from(EVENT_BANNER_BUCKET).getPublicUrl(path).data.publicUrl;

  const { data, error } = await supabase
    .from("events")
    .update({ banner_url: url })
    .eq("id", eventId)
    .select("id");

  if (error || !data?.length) {
    await supabase.storage.from(EVENT_BANNER_BUCKET).remove([path]);
    return { ok: false, error: "Could not save the banner." };
  }

  const oldPath = bannerPath(current.banner_url);
  if (oldPath) await supabase.storage.from(EVENT_BANNER_BUCKET).remove([oldPath]);

  refresh();
  return { ok: true, url };
}

export async function removeEventBanner(eventId: string): Promise<BannerResult> {
  if (!(await isAdmin())) return { ok: false, error: NO_PERMISSION };
  if (!idSchema.safeParse(eventId).success) return { ok: false, error: "Event not found." };

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("events")
    .select("banner_url")
    .eq("id", eventId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("events")
    .update({ banner_url: null })
    .eq("id", eventId)
    .select("id");

  if (error || !data?.length) return { ok: false, error: "Could not remove the banner." };

  const oldPath = bannerPath(current?.banner_url ?? null);
  if (oldPath) await supabase.storage.from(EVENT_BANNER_BUCKET).remove([oldPath]);

  refresh();
  return { ok: true, url: null };
}