import { House, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { StatusPageComponent } from "@/shared/ui/custom-components/status-page-component";

export default function RouteErrorPage() {
  return (
    <div className="flex min-h-svh bg-background p-6">
      <StatusPageComponent
        code="500"
        title="Algo salió de órbita."
        description="Ocurrió un error inesperado al mostrar esta pantalla. Intenta recargar la página."
      >
        <Button size="lg" onClick={() => window.location.reload()}>
          <RotateCw />
          Recargar
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link to="/" reloadDocument />}
        >
          <House />
          Volver al inicio
        </Button>
      </StatusPageComponent>
    </div>
  );
}
