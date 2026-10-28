import { ArrowLeft, House } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center w-full h-full">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 text-center">
        <svg
          aria-hidden="true"
          viewBox="0 40 240 120"
          fill="none"
          className="h-36 w-60"
        >
          <ellipse
            cx="120"
            cy="100"
            rx="110"
            ry="34"
            transform="rotate(-18 120 100)"
            className="stroke-info"
            strokeOpacity=".4"
          />
          <ellipse
            cx="120"
            cy="100"
            rx="76"
            ry="22"
            transform="rotate(-18 120 100)"
            className="stroke-primary"
            strokeOpacity=".6"
          />
          <circle
            cx="120"
            cy="100"
            r="16"
            className="fill-card stroke-primary"
            strokeOpacity=".8"
          />
          <circle cx="205" cy="76" r="3.5" className="fill-info" />
        </svg>

        <p className="bg-linear-to-br from-primary to-info bg-clip-text text-7xl leading-none font-bold tracking-tighter text-transparent">
          404
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Te alejaste demasiado de la órbita.
        </h1>
        <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
          Esta página no existe o no tienes acceso a ella.
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-2.5">
          <Button size="lg" nativeButton={false} render={<Link to="/" />}>
            <House />
            Volver al inicio
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Ir atrás
          </Button>
        </div>
      </div>
    </div>
  );
}
