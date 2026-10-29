import { useState } from "react";
import { cn } from "cn";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FolderKanban,
  House,
  LogOut,
  Moon,
  Orbit,
  Plus,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  sidebarMenuButtonVariants,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { useTheme } from "@/context/theme/use-theme";
import { useLogout } from "@/features/auth/api/queries";
import { useGetModules } from "@/features/modules/api/queries";
import { useGetProjects } from "@/features/projects/api/queries";
import ProjectFormDialog from "@/features/projects/pages/components/project-form-dialog";
import { UserAvatarComponent } from "./user-avatar-component";

const MODULE_ROUTES: Record<string, string> = {
  home: "/",
  users: "/users",
  projects: "/projects",
};

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
  const navigate = useNavigate();
  const { state, isMobile } = useSidebar();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { canWrite: canWriteProjects } = usePermission("projects");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const logoutMutation = useLogout();
  const { data: modules = [] } = useGetModules();
  const accessibleModuleKeys = new Set(
    user?.permissions
      .filter((permission) => permission.canRead || permission.canWrite)
      .map((permission) => permission.module) ?? [],
  );
  const hasProjects = accessibleModuleKeys.has("projects");
  const { data: projects = [] } = useGetProjects({ enabled: hasProjects });

  const isCollapsed = state === "collapsed" && !isMobile;
  const hasActiveProject = projects.some((project) =>
    isPathActive(pathname, `/projects/${project.id}`),
  );
  const isDark = theme === "dark";

  const navigationItems = modules.filter(
    (module) =>
      module.parentKey === null &&
      module.key !== "projects" &&
      accessibleModuleKeys.has(module.key) &&
      MODULE_ROUTES[module.key] !== undefined,
  );

  return (
    <Sidebar
      collapsible="icon"
      className="z-30 border-r border-sidebar-border"
    >
      <SidebarTrigger
        aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
        className="absolute top-6 -right-3 z-20 hidden size-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-sm hover:bg-accent hover:text-foreground md:inline-flex"
      >
        {isCollapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </SidebarTrigger>

      <SidebarHeader
        className={isCollapsed ? "items-center px-2 py-4" : "px-4 py-4"}
      >
        <NavLink
          to="/"
          end
          className="flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1 text-lg font-bold tracking-tight text-sidebar-foreground"
          aria-label="Orbit, inicio"
        >
          <Orbit className="size-7 shrink-0 text-sidebar-primary" />
          {!isCollapsed && <span className="truncate">Orbit</span>}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((module) => {
                const url = MODULE_ROUTES[module.key]!;
                const Icon = MODULE_ICONS[module.icon ?? ""] ?? House;

                return (
                  <SidebarMenuItem key={module.key}>
                    <SidebarMenuButton
                      render={<NavLink to={url} end={url === "/"} />}
                      isActive={isPathActive(pathname, url)}
                      tooltip={module.name}
                    >
                      <Icon />
                      <span>{module.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasProjects && isCollapsed && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Proyectos"
                    data-active={hasActiveProject || undefined}
                    className={cn(sidebarMenuButtonVariants(), "cursor-pointer")}
                  >
                    <FolderKanban />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-64">
                    <DropdownMenuLabel className="text-[0.65rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Proyectos
                    </DropdownMenuLabel>
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        className={
                          isPathActive(pathname, `/projects/${project.id}`)
                            ? "bg-accent font-medium"
                            : undefined
                        }
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
                          {project.projectKey}
                        </span>
                        <span className="truncate">{project.name}</span>
                      </DropdownMenuItem>
                    ))}
                    {projects.length === 0 && (
                      <p className="px-2.5 py-2 text-sm text-muted-foreground">
                        Aún no tienes proyectos.
                      </p>
                    )}
                    {canWriteProjects && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setIsCreatingProject(true)}
                        >
                          <Plus />
                          Nuevo proyecto
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}

        {hasProjects && !isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Proyectos</SidebarGroupLabel>
            {canWriteProjects && (
              <SidebarGroupAction
                aria-label="Nuevo proyecto"
                title="Nuevo proyecto"
                onClick={() => setIsCreatingProject(true)}
              >
                <Plus />
              </SidebarGroupAction>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="not-group-data-[collapsible=icon]:ml-5 not-group-data-[collapsible=icon]:gap-0.5 not-group-data-[collapsible=icon]:border-l not-group-data-[collapsible=icon]:border-sidebar-border">
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      render={<NavLink to={`/projects/${project.id}`} />}
                      isActive={isPathActive(
                        pathname,
                        `/projects/${project.id}`,
                      )}
                      tooltip={project.name}
                      className="not-group-data-[collapsible=icon]:h-8 not-group-data-[collapsible=icon]:gap-2.5 not-group-data-[collapsible=icon]:rounded-l-none not-group-data-[collapsible=icon]:px-3 not-group-data-[collapsible=icon]:text-[0.8125rem] not-group-data-[collapsible=icon]:data-active:shadow-[inset_2px_0_0_var(--sidebar-primary)] not-group-data-[collapsible=icon]:data-active:before:hidden"
                    >
                      <span className="w-7 shrink-0 font-mono text-[0.7rem] font-medium text-sidebar-foreground/60 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:text-xs group-data-active/menu-button:text-sidebar-primary">
                        {project.projectKey}
                      </span>
                      <span>{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {projects.length === 0 && !isCollapsed && (
                  <li className="px-3 py-2 text-sm text-sidebar-foreground/60">
                    Aún no tienes proyectos.
                  </li>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border p-2 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:p-1"
              aria-label="Menú de cuenta"
            >
              <UserAvatarComponent name={user.name} />
              <span className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                <span className="block truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-sidebar-foreground/60">
                  {user.email}
                </span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isCollapsed ? "right" : "top"}
              align={isCollapsed ? "end" : "start"}
              className="w-60"
            >
              <DropdownMenuLabel>
                <span className="block truncate text-sm font-semibold">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {isDark ? <Sun /> : <Moon />}
                {isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut />
                {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>

      {isCreatingProject && (
        <ProjectFormDialog
          onClose={() => setIsCreatingProject(false)}
          onCreated={(project) => navigate(`/projects/${project.id}`)}
        />
      )}
    </Sidebar>
  );
}
