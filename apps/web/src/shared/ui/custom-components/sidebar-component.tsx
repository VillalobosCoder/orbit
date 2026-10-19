import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, House, Orbit, type LucideIcon } from "lucide-react";

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

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: Omit<SidebarItem, "icon" | "items">[];
}

const navigationItems: SidebarItem[] = [
  {
    title: "Inicio",
    url: "/",
    icon: House,
    items: [],
  },
];

function isPathActive(pathname: string, url: string) {
  if (url === "/") {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

export default function SidebarComponent() {
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

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
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const hasActiveChild =
                  item.items?.some((child) =>
                    isPathActive(pathname, child.url),
                  ) ?? false;
                const isActive =
                  isPathActive(pathname, item.url) || hasActiveChild;
                const isExpanded = expandedItems[item.url] ?? hasActiveChild;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<NavLink to={item.url} end={item.url === "/"} />}
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>

                    {item.items && item.items.length > 0 && (
                      <>
                        {state === "expanded" && (
                          <button
                            type="button"
                            className="absolute right-1 top-1.5 flex size-6 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${item.title}`}
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpandedItems((current) => ({
                                ...current,
                                [item.url]: !isExpanded,
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
                            {item.items.map((child) => (
                              <SidebarMenuSubItem key={child.url}>
                                <SidebarMenuSubButton
                                  render={
                                    <NavLink
                                      to={child.url}
                                      end={child.url === "/"}
                                    />
                                  }
                                  isActive={isPathActive(pathname, child.url)}
                                >
                                  <span>{child.title}</span>
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
