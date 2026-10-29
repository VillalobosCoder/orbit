import { Outlet } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarComponent from "@/shared/ui/custom-components/sidebar-component";

export default function ModuleLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-svh w-full min-w-0 overflow-hidden bg-background">
        <SidebarComponent />
        <SidebarInset className="min-h-0 min-w-0 bg-transparent">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:hidden">
            <SidebarTrigger aria-label="Abrir navegación" />
          </header>
          <div className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
