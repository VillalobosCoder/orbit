import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner.tsx";
import { useAuth } from "@/context/auth/use-auth";

function GuardLoading() {
  return (
    <div
      className="flex min-h-dvh w-full items-center justify-center bg-background text-primary"
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <span className="sr-only">Cargando sesión...</span>
    </div>
  );
}

export const CHANGE_PASSWORD_PATH = "/cambiar-contrasena";

export function PrivateGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) return <GuardLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }
  return <Outlet />;
}

export function PublicGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <GuardLoading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}