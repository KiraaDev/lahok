import { Suspense } from "react";
import { redirect, unauthorized } from "next/navigation";
import { connection } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getBarangaySettings } from "@/lib/settings";
import { AuthLoading } from "@/components/auth/auth-loading";
import { AppShell } from "@/components/layout/app-shell";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { getBranding } from "@/lib/branding";

const ADMIN_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/events": "Events",
  "/admin/events/new": "New event",
  "/admin/participants": "Participants",
  "/admin/settings": "Settings",
  "/admin/events/[id]/edit": "Edit event",
};
async function AdminContent({ children }: { children: React.ReactNode }) {
  await connection();
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect("/auth/login");
  if (currentUser.role !== "admin") unauthorized();

  const settings = await getBarangaySettings();
  const branding = getBranding(settings);

  return (
    <AppShell
      sidebar={
        <AdminSidebar
          barangayName={branding.sidebarSubtitle}
          logoUrl={settings.logo_url}
        />
      }
      header={
        <AppHeader
          section={"admin"}
          titles={ADMIN_TITLES}
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AdminContent>{children}</AdminContent>
    </Suspense>
  );
}
