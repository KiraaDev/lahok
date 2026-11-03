import { Suspense } from "react";
import { redirect, unauthorized } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

async function StaffContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (currentUser.role !== "staff") {
    unauthorized();
  }

  return children;
}

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Loading staff dashboard...</div>}>
      <StaffContent>{children}</StaffContent>
    </Suspense>
  );
}