"use client";

import { LayoutDashboard, ScanLine } from "lucide-react";
import { NavSidebar, type NavItem } from "./nav-sidebar";

const STAFF_NAV: NavItem[] = [
  { title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { title: "Check-in", href: "/staff/check-in", icon: ScanLine },
];

type Props = { barangayName: string; logoUrl: string | null };

export function StaffSidebar(props: Props) {
  return (
    <NavSidebar
      homeHref="/staff/dashboard"
      groupLabel="Staff"
      items={STAFF_NAV}
      {...props}
    />
  );
}