import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import type { UserRole } from "@/types/profile";

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
};

export function getDashboardPath(role: UserRole) {
  return ROLE_REDIRECTS[role];
}

export async function requireUser(role?: "admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (role === "admin" && profile.role !== "admin") redirect("/dashboard");

  return { user, role: profile.role };
}

