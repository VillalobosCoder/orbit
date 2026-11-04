import { House, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { StatusPageComponent } from "@/components/ui/status-page-component";
import { useI18n } from "@/i18n/use-i18n";

export default function RouteErrorPage() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-svh bg-background p-6">
      <StatusPageComponent
        code="500"
        title={t("shell.routeError.title")}
        description={t("shell.routeError.description")}
      >
        <Button size="lg" onClick={() => window.location.reload()}>
          <RotateCw />
          {t("common.reload")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link to="/" reloadDocument />}
        >
          <House />
          {t("common.goHome")}
        </Button>
      </StatusPageComponent>
    </div>
  );
}
