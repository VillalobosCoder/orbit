import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  House,
  Orbit,
  UserRound,
  type LucideIcon,
} from "lucide-react";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth/use-auth";
import { useGetModules } from "@/features/modules/api/queries";

const MODULE_ROUTES: Record<string, string> = {
  home: "/",
  users: "/users",
};

const MODULE_ICONS: Record<string, LucideIcon> = {
  House,
  Users: UserRound,
};

function isPathActive(pathname: string, url: string) {
  if (url === "/") {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

export default function SidebarComponent() {
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const { user } = useAuth();
  const { data: modules = [] } = useGetModules();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );
  const accessibleModuleKeys = new Set(
    user?.permissions
      .filter((permission) => permission.canRead || permission.canWrite)
      .map((permission) => permission.module) ?? [],
  );
  const navigationItems = modules
    .filter(
      (module) =>
        module.parentKey === null &&
        accessibleModuleKeys.has(module.key) &&
        MODULE_ROUTES[module.key] !== undefined,
    )
    .map((module) => ({
      module,
      children: modules.filter(
        (child) =>
          child.parentKey === module.key &&
          accessibleModuleKeys.has(child.key) &&
          MODULE_ROUTES[child.key] !== undefined,
      ),
    }));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <NavLink
          to="/"
          end
          className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-sidebar-foreground"
          aria-label="Orbit, inicio"
        >
          <Orbit className="size-5 shrink-0 text-sidebar-primary" />
          {state === "expanded" && (
            <span className="truncate font-semibold">Orbit</span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(({ module, children }) => {
                const url = MODULE_ROUTES[module.key]!;
                const Icon = MODULE_ICONS[module.icon ?? ""] ?? House;
                const hasActiveChild = children.some((child) =>
                  isPathActive(pathname, MODULE_ROUTES[child.key]!),
                );
                const isActive =
                  isPathActive(pathname, url) || hasActiveChild;
                const isExpanded =
                  expandedItems[module.key] ?? hasActiveChild;

                return (
                  <SidebarMenuItem key={module.key}>
                    <SidebarMenuButton
                      render={<NavLink to={url} end={url === "/"} />}
                      isActive={isActive}
                      tooltip={module.name}
                    >
                      <Icon />
                      <span>{module.name}</span>
                    </SidebarMenuButton>

                    {children.length > 0 && (
                      <>
                        {state === "expanded" && (
                          <button
                            type="button"
                            className="absolute right-1 top-1.5 flex size-6 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${module.name}`}
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpandedItems((current) => ({
                                ...current,
                                [module.key]: !isExpanded,
                              }))
                            }
                          >
                            <ChevronDown
                              className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                        {state === "expanded" && isExpanded && (
                          <SidebarMenuSub>
                            {children.map((child) => {
                              const childUrl = MODULE_ROUTES[child.key]!;

                              return (
                                <SidebarMenuSubItem key={child.key}>
                                  <SidebarMenuSubButton
                                    render={
                                      <NavLink
                                        to={childUrl}
                                        end={childUrl === "/"}
                                      />
                                    }
                                    isActive={isPathActive(pathname, childUrl)}
                                  >
                                    <span>{child.name}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
