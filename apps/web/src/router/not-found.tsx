import { ArrowLeft, House } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";
import { StatusPageComponent } from "@/shared/ui/custom-components/status-page-component";
import { useI18n } from "@/i18n/use-i18n";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <StatusPageComponent
      code="404"
      title={t("shell.notFound.title")}
      description={t("shell.notFound.description")}
    >
      <Button size="lg" nativeButton={false} render={<Link to="/" />}>
        <House />
        {t("common.goHome")}
      </Button>
      <Button size="lg" variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft />
        {t("common.goBack")}
      </Button>
    </StatusPageComponent>
  );
}
