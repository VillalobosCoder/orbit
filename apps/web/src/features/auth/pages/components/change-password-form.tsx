import { useState, type SubmitEvent } from "react";
import { Check, Circle, CircleAlert } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { useChangePassword } from "@/features/auth/api/queries";

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

interface ChangePasswordFormProps {
  currentLabel: string;
  differentRuleLabel: string;
  submitLabel: string;
  successMessage?: string;
  fullWidthSubmit?: boolean;
}

export default function ChangePasswordForm({
  currentLabel,
  differentRuleLabel,
  submitLabel,
  successMessage,
  fullWidthSubmit = false,
}: ChangePasswordFormProps) {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [succeeded, setSucceeded] = useState(false);

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

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmation("");
          setSucceeded(true);
        },
      },
    );
  }

  function edit(setter: (value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setSucceeded(false);
      setter(event.currentTarget.value);
    };
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="currentPassword">{currentLabel}</FieldLabel>
          <PasswordInput
            id="currentPassword"
            autoComplete="current-password"
            value={currentPassword}
            onChange={edit(setCurrentPassword)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="newPassword">Nueva contraseña</FieldLabel>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={edit(setNewPassword)}
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
            <Rule met={isDifferent}>{differentRuleLabel}</Rule>
          </ul>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmation}
            onChange={edit(setConfirmation)}
            aria-invalid={confirmation !== "" && !matches ? true : undefined}
            required
          />
          {confirmation !== "" && !matches && (
            <p className="text-sm text-destructive">
              Las contraseñas no coinciden.
            </p>
          )}
        </Field>

        {changePassword.error instanceof Error && !succeeded && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            {changePassword.error.message}
          </div>
        )}

        {succeeded && successMessage && (
          <p
            role="status"
            className="flex items-center gap-2.5 rounded-lg border border-success/40 bg-success/10 px-3 py-2.5 text-sm text-success"
          >
            <Check className="size-4 shrink-0" aria-hidden="true" />
            {successMessage}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className={cn(fullWidthSubmit ? "w-full" : "self-start")}
          disabled={!canSubmit || changePassword.isPending}
        >
          {changePassword.isPending ? <Spinner /> : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
