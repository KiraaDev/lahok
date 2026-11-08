// app/(protected)/staff/layout.tsx
import { Suspense } from "react";
import { redirect, unauthorized } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getBarangaySettings } from "@/lib/settings";
import { getBranding } from "@/lib/branding";
import { AuthLoading } from "@/components/auth/auth-loading";
import { AppShell } from "@/components/layout/app-shell";
import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { AppHeader } from "@/components/layout/app-header";

const STAFF_TITLES = {
  "/staff/dashboard": "Dashboard",
  "/staff/check-in": "Check-in",
};

async function StaffContent({ children }: { children: React.ReactNode }) {
  await connection();

  const currentUser = await getCurrentUser();

  if (!currentUser) redirect("/auth/login");
  if (currentUser.role !== "staff" && currentUser.role !== "admin")
    unauthorized();

  const settings = await getBarangaySettings();
  const branding = getBranding(settings);

  return (
    <AppShell
      sidebar={
        <StaffSidebar
          barangayName={branding.sidebarSubtitle}
          logoUrl={settings.logo_url}
        />
      }
      header={
        <AppHeader
          section="staff"
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

export default function StaffLayout({
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
