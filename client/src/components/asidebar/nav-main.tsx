"use client";

import {
  LucideIcon,
  Settings,
  Users,
  CheckCircle,
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  ListChecks,
  Gauge,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Permissions } from "@/constant";

type ItemType = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export function NavMain() {
  const { hasPermission } = useAuthContext();

  const canManageSettings = hasPermission(
    Permissions.MANAGE_WORKSPACE_SETTINGS
  );
  const canViewAllTasks = hasPermission(Permissions.VIEW_ALL_TASKS);

  const workspaceId = useWorkspaceId();
  const location = useLocation();

  const pathname = location.pathname;

  const items: ItemType[] = [
    {
      title: "Dashboard",
      url: `/workspace/${workspaceId}`,
      icon: LayoutDashboard,
    },
    ...(canViewAllTasks
      ? [
          {
            title: "Tasks",
            url: `/workspace/${workspaceId}/tasks`,
            icon: CheckCircle,
          },
        ]
      : []),
    {
      title: "Members",
      url: `/workspace/${workspaceId}/members`,
      icon: Users,
    },

    ...(canManageSettings
      ? [
          {
            title: "Settings",
            url: `/workspace/${workspaceId}/settings`,
            icon: Settings,
          },
        ]
      : []),
  ];
  // These two are the signed-in user's own data, not the workspace's, so they
  // sit under their own label rather than mixed in with the shared pages.
  const personalItems: ItemType[] = [
    {
      title: "My Dashboard",
      url: `/workspace/${workspaceId}/my-dashboard`,
      icon: Gauge,
    },
    {
      title: "My Tasks",
      url: `/workspace/${workspaceId}/my-tasks`,
      icon: ListChecks,
    },
    {
      title: "My Meetings",
      url: `/workspace/${workspaceId}/my-meetings`,
      icon: CalendarDays,
    },
    {
      title: "My Notes",
      url: `/workspace/${workspaceId}/my-notes`,
      icon: NotebookPen,
    },
  ];

  const renderItem = (item: ItemType) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton isActive={item.url === pathname} asChild>
        <Link to={item.url} className="!text-[15px]">
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>{items.map(renderItem)}</SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="!pt-0">
        <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-[0.14em]">
          Personal
        </SidebarGroupLabel>
        <SidebarMenu>{personalItems.map(renderItem)}</SidebarMenu>
      </SidebarGroup>
    </>
  );
}
