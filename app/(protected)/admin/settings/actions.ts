
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { settingsSchema, type SettingsData } from "@/lib/validations/settings";

type Result = { ok: true } | { ok: false; error: string };
type LogoResult = { ok: true; url: string | null } | { ok: false; error: string };

const NO_PERMISSION = "You don't have permission to do that.";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

function storagePath(url: string | null) {
  if (!url) return null;

  const marker = "/branding/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return decodeURIComponent(
    url.slice(index + marker.length).split("?")[0]
  );
}

async function deleteLogo(path: string | null) {
  if (!path) return;

  const supabase = await createClient();

  await supabase.storage
    .from("branding")
    .remove([path]);
}

export async function updateSettings(
  values: SettingsData
): Promise<Result> {
  if (!(await isAdmin())) {
    return { ok: false, error: NO_PERMISSION };
  }

  const parsed = settingsSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barangay_settings")
    .update(parsed.data)
    .eq("id", 1)
    .select("id");

  if (error || !data?.length) {
    return {
      ok: false,
      error: "Could not save settings. Please try again.",
    };
  }

  revalidatePath("/", "layout");

  return { ok: true };
}

export async function uploadLogo(
  formData: FormData
): Promise<LogoResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: NO_PERMISSION };
  }

  const file = formData.get("logo");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." };
  }

  if (file.size > MAX_LOGO_BYTES) {
    return { ok: false, error: "Image must be 2 MB or smaller." };
  }

  const ext = LOGO_TYPES[file.type];

  if (!ext) {
    return { ok: false, error: "Use a PNG, JPG, or WebP image." };
  }

  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase
    .from("barangay_settings")
    .select("logo_url")
    .eq("id", 1)
    .single();

  if (currentError) {
    return { ok: false, error: "Could not retrieve current settings." };
  }

  const oldPath = storagePath(current.logo_url);
  const newPath = `logo-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("branding")
    .upload(newPath, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });

  if (uploadError) {
    return { ok: false, error: "Upload failed. Please try again." };
  }

  const url = supabase.storage
    .from("branding")
    .getPublicUrl(newPath).data.publicUrl;

  const { data, error } = await supabase
    .from("barangay_settings")
    .update({ logo_url: url })
    .eq("id", 1)
    .select("id");

  if (error || !data?.length) {
    await deleteLogo(newPath);

    return {
      ok: false,
      error: "Could not save the logo.",
    };
  }

  if (oldPath && oldPath !== newPath) {
    await deleteLogo(oldPath);
  }

  revalidatePath("/", "layout");

  return { ok: true, url };
}

export async function removeLogo(): Promise<LogoResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: NO_PERMISSION };
  }

  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase
    .from("barangay_settings")
    .select("logo_url")
    .eq("id", 1)
    .single();

  if (currentError) {
    return { ok: false, error: "Could not retrieve current settings." };
  }

  const oldPath = storagePath(current.logo_url);

  const { data, error } = await supabase
    .from("barangay_settings")
    .update({ logo_url: null })
    .eq("id", 1)
    .select("id");

  if (error || !data?.length) {
    return {
      ok: false,
      error: "Could not remove the logo.",
    };
  }

  if (oldPath) {
    await deleteLogo(oldPath);
  }

  revalidatePath("/", "layout");

  return { ok: true, url: null };
}
