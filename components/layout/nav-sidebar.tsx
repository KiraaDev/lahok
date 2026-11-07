"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

type Props = {
  homeHref: string;
  groupLabel: string;
  items: NavItem[];
  barangayName: string;
  logoUrl: string | null;
};

export function NavSidebar({
  homeHref,
  groupLabel,
  items,
  barangayName,
  logoUrl,
}: Props) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const closeMobile = () => setOpenMobile(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={barangayName}
              render={<Link href={homeHref} onClick={closeMobile} />}
            >
              <Avatar className="size-8 rounded-lg">
                {logoUrl && <AvatarImage src={logoUrl} alt="" />}
                <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  {barangayName.charAt(0).toUpperCase() || "L"}
                </AvatarFallback>
              </Avatar>

              <div className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">Lahok</span>
                <span className="truncate text-xs text-muted-foreground">
                  {barangayName}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.href} onClick={closeMobile} />}
                      className={cn(
                        active &&
                          "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}