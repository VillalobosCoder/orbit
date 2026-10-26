import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronDown,
  FolderKanban,
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
import { useGetProjects } from "@/features/projects/api/queries";

const MODULE_ROUTES: Record<string, string> = {
  home: "/",
  users: "/users",
  projects: "/projects",
};

type NavChild = { key: string; name: string; url: string };

const MODULE_ICONS: Record<string, LucideIcon> = {
  House,
  Users: UserRound,
  FolderKanban,
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
  const { data: projects = [] } = useGetProjects({
    enabled: accessibleModuleKeys.has("projects"),
  });
  function getChildren(moduleKey: string): NavChild[] {
    if (moduleKey === "projects") {
      return projects.map((project) => ({
        key: `project-${project.id}`,
        name: `${project.projectKey} · ${project.name}`,
        url: `/projects/${project.id}`,
      }));
    }

    return modules
      .filter(
        (child) =>
          child.parentKey === moduleKey &&
          accessibleModuleKeys.has(child.key) &&
          MODULE_ROUTES[child.key] !== undefined,
      )
      .map((child) => ({
        key: child.key,
        name: child.name,
        url: MODULE_ROUTES[child.key]!,
      }));
  }

  const navigationItems = modules
    .filter(
      (module) =>
        module.parentKey === null &&
        accessibleModuleKeys.has(module.key) &&
        MODULE_ROUTES[module.key] !== undefined,
    )
    .map((module) => ({
      module,
      children: getChildren(module.key),
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
                  isPathActive(pathname, child.url),
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
                            {children.map((child) => (
                              <SidebarMenuSubItem key={child.key}>
                                <SidebarMenuSubButton
                                  render={
                                    <NavLink
                                      to={child.url}
                                      end={child.url === "/"}
                                    />
                                  }
                                  isActive={isPathActive(pathname, child.url)}
                                >
                                  <span>{child.name}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
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
