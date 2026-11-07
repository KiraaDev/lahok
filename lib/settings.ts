import "server-only";

import type { BarangaySettings } from "@/types/settings";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";

const DEFAULTS: BarangaySettings = {
  id: 1,
  barangay_name: "Your Barangay",
  municipality_city: null,
  province: null,
  logo_url: null,
  primary_color: "#1D4ED8",
  contact_email: null,
  contact_number: null,
  facebook_url: null,
  about: null,
  updated_at: new Date(0).toISOString(),
};

export async function getBarangaySettings(): Promise<BarangaySettings> {
  "use cache";
  cacheTag("barangay-settings");
  cacheLife("minutes");

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("barangay_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  return (data as BarangaySettings | null) ?? DEFAULTS;
}
