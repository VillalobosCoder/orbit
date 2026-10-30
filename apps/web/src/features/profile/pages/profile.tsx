import { useState, type SubmitEvent } from "react";
import { Check, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth/use-auth";
import { useUpdateProfile } from "@/features/auth/api/queries";
import ChangePasswordForm from "@/features/auth/pages/components/change-password-form";
import { PageHeaderComponent } from "@/shared/ui/custom-components/page-header-component";
import { UserAvatarComponent } from "@/shared/ui/custom-components/user-avatar-component";

export default function ProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const fullName = `${user.name} ${user.lastName}`;
  const hasChanges =
    name.trim() !== user.name || lastName.trim() !== user.lastName;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    updateProfile.mutate(
      { name, lastName },
      { onSuccess: () => setSaved(true) },
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <PageHeaderComponent
        title="Mi perfil"
        description="Tus datos personales y la seguridad de tu cuenta."
      />

      <section
        aria-label="Datos personales"
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="mb-6 flex items-center gap-4">
          <UserAvatarComponent name={fullName} className="size-16 text-xl" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{fullName}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  minLength={2}
                  maxLength={50}
                  autoComplete="given-name"
                  onChange={(event) => {
                    setSaved(false);
                    setName(event.currentTarget.value);
                  }}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                <Input
                  id="lastName"
                  value={lastName}
                  minLength={2}
                  maxLength={50}
                  autoComplete="family-name"
                  onChange={(event) => {
                    setSaved(false);
                    setLastName(event.currentTarget.value);
                  }}
                  required
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input id="email" value={user.email} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                El correo solo lo cambia un administrador.
              </p>
            </Field>

            {updateProfile.error instanceof Error && !saved && (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                {updateProfile.error.message}
              </div>
            )}
            {saved && (
              <p
                role="status"
                className="flex items-center gap-2.5 rounded-lg border border-success/40 bg-success/10 px-3 py-2.5 text-sm text-success"
              >
                <Check className="size-4 shrink-0" aria-hidden="true" />
                Cambios guardados.
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="self-start"
              disabled={!hasChanges || updateProfile.isPending}
            >
              {updateProfile.isPending ? <Spinner /> : "Guardar cambios"}
            </Button>
          </FieldGroup>
        </form>
      </section>

      <section
        aria-label="Seguridad"
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">Contraseña</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          Usa una contraseña que no repitas en otros sitios.
        </p>
        <div className="max-w-md">
          <ChangePasswordForm
            currentLabel="Contraseña actual"
            differentRuleLabel="Distinta de la actual"
            submitLabel="Cambiar contraseña"
            successMessage="Contraseña actualizada."
          />
        </div>
      </section>
    </div>
  );
}
