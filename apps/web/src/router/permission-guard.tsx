import { Outlet } from "react-router-dom";
import { usePermission } from "@/context/auth/use-permission";

export function PermissionGuard({ module }: { module: string }) {
  const { hasAccess } = usePermission(module);

  if (!hasAccess) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-md border border-border bg-card p-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Acceso denegado
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No tienes permisos para acceder a esta pantalla. Contacta al
            administrador de tu organización.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
