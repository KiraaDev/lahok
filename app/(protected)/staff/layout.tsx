import { Suspense } from "react";
import { redirect, unauthorized } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getBarangaySettings } from "@/lib/settings";
import { AuthLoading } from "@/components/auth/auth-loading";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { StaffSidebar } from "@/components/layout/staff-sidebar";

const STAFF_TITLES = {
  "/staff/dashboard": "Dashboard",
  "/staff/settings": "Settings",
};

async function StaffContent({ children }: { children: React.ReactNode }) {
  await connection()
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect("/auth/login");
  if (currentUser.role !== "staff") unauthorized();

  const settings = await getBarangaySettings();

  return (
    <AppShell
      sidebar={
        <StaffSidebar
          barangayName={settings.barangay_name}
          logoUrl={settings.logo_url}
        />
      }
      header={
        <AppHeader
          section={"staff"}
          titles={STAFF_TITLES}
          fullName={currentUser.full_name}
          email={currentUser.email ?? currentUser.authUser.email ?? ""}
          role={currentUser.role}
        />
      }
    >
      {children}
    </AppShell>
  );
}

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <Suspense fallback={<AuthLoading />}>
      <StaffContent>{children}</StaffContent>
    </Suspense>
  );
}