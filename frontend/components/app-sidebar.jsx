"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconKey,
  IconSettings,
  IconUsers,
  IconListDetails,
} from "@tabler/icons-react";
import { useAuth } from "@/context/AuthContext";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Overview",
    url: "/admin/overview",
    icon: IconDashboard,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: IconUsers,
  },
];

const navDashboard = [
  {
    title: "Dashboard",
    icon: IconDashboard,
    isActive: true,
    url: "/dashboard",
  },
  {
    title: "API Keys",
    icon: IconKey,
    url: "/dashboard/api-keys",
  },
  {
    title: "Billing",
    icon: IconFileDescription,
    url: "/dashboard/billing",
  },
  {
    title: "Documentation",
    icon: IconFileDescription,
    url: "/dashboard/docs",
  },
  {
    title: "Settings",
    icon: IconSettings,
    url: "/dashboard/settings",
  },
];

const navAdmin = [
  {
    title: "All Users",
    icon: IconUsers,
    url: "/dashboard/admin/users",
  },
];

export function AppSidebar({ ...props }) {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 h-10 rounded"
            >
              <a href="#">
                <img src="/logo.png" className="!size-10" />
                <span className="text-base font-semibold">DairyNews7x7</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navDashboard} />
        {user && user.role === 'admin' && (
          <>
            {/* <SidebarSeparator className="my-4" /> */}
            <NavMain items={navAdmin} title="Admin" />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        {user ? <NavUser user={user} /> : <div>Loading...</div>}
      </SidebarFooter>
    </Sidebar>
  );
}
