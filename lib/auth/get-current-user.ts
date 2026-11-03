
import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/types/profile";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    ...profile,
    authUser: user,
  };
}
