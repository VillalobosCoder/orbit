import { Navigate } from "react-router-dom";
import { Orbit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/use-auth";
import { useLogout } from "@/features/auth/api/queries";
import ChangePasswordForm from "../components/change-password-form";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user?.mustChangePassword) return <Navigate to="/" replace />;

  return (
    <main className="mx-auto w-full max-w-md">
      <div className="mb-5 flex items-center justify-center gap-2.5 text-2xl font-bold tracking-tight">
        <Orbit className="size-8 text-primary" aria-hidden="true" />
        Orbit
      </div>
      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-8 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido, {user.name}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Es tu primer inicio de sesión. Por seguridad, cambia la contraseña
            temporal por una propia para continuar.
          </p>
        </div>

        <ChangePasswordForm
          currentLabel="Contraseña temporal"
          differentRuleLabel="Distinta de la temporal"
          submitLabel="Guardar y entrar"
          fullWidthSubmit
        />

        <p className="text-center text-xs text-muted-foreground">
          No podrás usar Orbit hasta completar este paso.{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            Cerrar sesión
          </Button>
        </p>
      </div>
    </main>
  );
}
