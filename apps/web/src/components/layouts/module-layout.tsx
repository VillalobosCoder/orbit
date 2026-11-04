import { Outlet } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarComponent from "@/components/layouts/sidebar-component";
import { useI18n } from "@/i18n/use-i18n";

export default function ModuleLayout() {
  const { t } = useI18n();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-svh w-full min-w-0 overflow-hidden bg-background">
        <SidebarComponent />
        <SidebarInset className="min-h-0 min-w-0 bg-transparent">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 md:hidden">
            <SidebarTrigger aria-label={t("shell.sidebar.openNavigation")} />
          </header>
          <div className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
