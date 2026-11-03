
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getDashboardPath } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

export async function login(values: LoginValues) {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: "Please check your email and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    await supabase.auth.signOut();
    return { error: "Unable to verify your account permissions." };
  }

  redirect(getDashboardPath(currentUser.role));
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/auth/login");
}
