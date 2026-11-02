import { ArrowLeft } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/auth/use-permission";
import { StatusPageComponent } from "@/shared/ui/custom-components/status-page-component";
import { useI18n } from "@/i18n/use-i18n";

export function PermissionGuard({ module }: { module: string }) {
  const { hasAccess } = usePermission(module);
  const navigate = useNavigate();
  const { t } = useI18n();

  if (!hasAccess) {
    return (
      <StatusPageComponent
        code="403"
        title={t("shell.forbidden.title")}
        description={t("shell.forbidden.description")}
      >
        <Button size="lg" variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft />
          {t("common.goBack")}
        </Button>
      </StatusPageComponent>
    );
  }

  return <Outlet />;
}
