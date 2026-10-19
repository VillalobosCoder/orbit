import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Pantalla no disponible
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Esta funcionalidad todavía no está disponible o la dirección cambió.
        </p>
        <div className="mt-5 inline-flex">
          <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} />
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}