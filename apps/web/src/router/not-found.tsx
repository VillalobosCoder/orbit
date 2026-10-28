import { ArrowLeft, House } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";
import { StatusPageComponent } from "@/shared/ui/custom-components/status-page-component";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <StatusPageComponent
      code="404"
      title="Te alejaste demasiado de la órbita."
      description="Esta página no existe o no tienes acceso a ella."
    >
      <Button size="lg" nativeButton={false} render={<Link to="/" />}>
        <House />
        Volver al inicio
      </Button>
      <Button size="lg" variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft />
        Ir atrás
      </Button>
    </StatusPageComponent>
  );
}
