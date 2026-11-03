
import { redirect, unauthorized } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (currentUser.role !== "staff") {
    unauthorized()
  }

  return children;
}
