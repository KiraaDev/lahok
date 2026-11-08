import "server-only";

import { connection } from "next/server";
import { redirect, unauthorized } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function requireStaff() {
  await connection();

  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "staff" && user.role !== "admin") unauthorized();

  return user;
}