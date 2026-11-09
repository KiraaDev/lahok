import "server-only";

import { redirect, unauthorized } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function requireAdmin() {

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "admin") unauthorized();

  return user;
}