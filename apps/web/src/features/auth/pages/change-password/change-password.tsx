import { useState, type SubmitEvent } from "react";
import { Navigate } from "react-router-dom";
import { Check, Circle, CircleAlert, Orbit } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth/use-auth";
import {
  useChangePassword,
  useLogout,
} from "@/features/auth/api/queries";

function Rule({ met, children }: { met: boolean; children: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-sm",
        met ? "text-success" : "text-muted-foreground",
      )}
    >
      {met ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Circle className="size-3.5" aria-hidden="true" />
      )}
      {children}
      <span className="sr-only">{met ? " (cumplido)" : " (pendiente)"}</span>
    </li>
  );
}

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const changePassword = useChangePassword();
  const logout = useLogout();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  if (!user?.mustChangePassword) return <Navigate to="/" replace />;

  const hasLength = newPassword.length >= 8;
  const hasUppercaseAndNumber =
    /\p{Lu}/u.test(newPassword) && /\d/.test(newPassword);
  const isDifferent = newPassword !== "" && newPassword !== currentPassword;
  const matches = confirmation !== "" && confirmation === newPassword;
  const strength = [
    hasLength,
    /\p{Lu}/u.test(newPassword),
    /\d/.test(newPassword),
    newPassword.length >= 12 || /[^\p{L}\d]/u.test(newPassword),
  ].filter(Boolean).length;
  const canSubmit =
    currentPassword !== "" &&
    hasLength &&
    hasUppercaseAndNumber &&
    isDifferent &&
    matches;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    changePassword.mutate({ currentPassword, newPassword });
  }

  return (
    <main className="mx-auto w-full max-w-md">
      <div className="mb-5 flex items-center justify-center gap-2.5 text-2xl font-bold tracking-tight">
        <Orbit className="size-8 text-primary" aria-hidden="true" />
        Orbit
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border bg-card p-8 shadow-lg"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido, {user.name}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Es tu primer inicio de sesión. Por seguridad, cambia la contraseña
            temporal por una propia para continuar.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="currentPassword">
              Contraseña temporal
            </FieldLabel>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.currentTarget.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.currentTarget.value)}
              aria-describedby="password-rules"
              required
            />
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((segment) => (
                <i
                  key={segment}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    segment > strength
                      ? "bg-muted"
                      : strength <= 1
                        ? "bg-destructive"
                        : strength === 2
                          ? "bg-warning"
                          : "bg-success",
                  )}
                />
              ))}
            </div>
            <ul id="password-rules" className="flex flex-col gap-1">
              <Rule met={hasLength}>Al menos 8 caracteres</Rule>
              <Rule met={hasUppercaseAndNumber}>Mayúscula y número</Rule>
              <Rule met={isDifferent}>Distinta de la temporal</Rule>
            </ul>
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirmar contraseña
            </FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.currentTarget.value)}
              aria-invalid={confirmation !== "" && !matches ? true : undefined}
              required
            />
            {confirmation !== "" && !matches && (
              <p className="text-sm text-destructive">
                Las contraseñas no coinciden.
              </p>
            )}
          </Field>

          {changePassword.error instanceof Error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              {changePassword.error.message}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!canSubmit || changePassword.isPending}
          >
            {changePassword.isPending ? <Spinner /> : "Guardar y entrar"}
          </Button>
        </FieldGroup>

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
      </form>
    </main>
  );
}
