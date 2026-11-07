"use client";

import { LayoutDashboard, Settings } from "lucide-react";
import { NavSidebar, type NavItem } from "./nav-sidebar";

const ADMIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

type Props = { barangayName: string; logoUrl: string | null };

export function AdminSidebar(props: Props) {
  return (
    <NavSidebar
      homeHref="/admin/dashboard"
      groupLabel="Admin"
      items={ADMIN_NAV}
      {...props}
    />
  );
}