import { ArrowLeft } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/auth/use-permission";
import { StatusPageComponent } from "@/shared/ui/custom-components/status-page-component";

export function PermissionGuard({ module }: { module: string }) {
  const { hasAccess } = usePermission(module);
  const navigate = useNavigate();

  if (!hasAccess) {
    return (
      <StatusPageComponent
        code="403"
        title="Acceso denegado"
        description="No tienes permisos para acceder a esta pantalla. Contacta al administrador de tu organización."
      >
        <Button size="lg" variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft />
          Ir atrás
        </Button>
      </StatusPageComponent>
    );
  }

  return <Outlet />;
}
