"use client";

import { LayoutDashboard, ScanLine, ShieldCheck } from "lucide-react";
import { NavSidebar, type NavItem } from "./nav-sidebar";

const STAFF_NAV: NavItem[] = [
  { title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { title: "Check-in", href: "/staff/check-in", icon: ScanLine },
];

const ADMIN_LINK: NavItem = {
  title: "Admin area",
  href: "/admin/dashboard",
  icon: ShieldCheck,
};


type Props = { isAdmin: boolean, barangayName: string; logoUrl: string | null };

export function StaffSidebar({ isAdmin = false, ...props }: Props) {
  return (
    <NavSidebar
      homeHref="/staff/dashboard"
      groupLabel="Staff"
     items={isAdmin ? [...STAFF_NAV, ADMIN_LINK] : STAFF_NAV}
      {...props}
    />
  );
}