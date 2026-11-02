import { Navigate } from "react-router-dom";
import { Orbit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/use-auth";
import { useLogout } from "@/features/auth/api/queries";
import ChangePasswordForm from "../components/change-password-form";
import { useI18n } from "@/i18n/use-i18n";

export default function ChangePasswordPage() {
  const { t } = useI18n();
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
            {t("auth.firstLogin.welcome", { name: user.name })}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t("auth.firstLogin.intro")}
          </p>
        </div>

        <ChangePasswordForm
          currentLabel={t("auth.firstLogin.currentLabel")}
          differentRuleLabel={t("auth.firstLogin.differentRule")}
          submitLabel={t("auth.firstLogin.submit")}
          fullWidthSubmit
        />

        <p className="text-center text-xs text-muted-foreground">
          {t("auth.firstLogin.blocked")}{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            {t("shell.sidebar.signOut")}
          </Button>
        </p>
      </div>
    </main>
  );
}
