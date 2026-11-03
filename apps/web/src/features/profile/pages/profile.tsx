import { useState, type SubmitEvent } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth/use-auth";
import { useUpdateProfile } from "@/features/auth/api/queries";
import ChangePasswordForm from "@/features/auth/pages/components/change-password-form";
import { PageHeaderComponent } from "@/components/ui/page-header-component";
import ProfilePhoto from "./components/profile-photo";
import { useI18n } from "@/i18n/use-i18n";

export default function ProfilePage() {
  const { t } = useI18n();
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
        title={t("profile.title")}
        description={t("profile.description")}
      />

      <section
        aria-label={t("profile.personal")}
        className="rounded-xl border border-border bg-card p-6"
      >
        <ProfilePhoto
          fullName={fullName}
          email={user.email}
          avatarUrl={user.avatarUrl}
        />

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">{t("common.name")}</FieldLabel>
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
                <FieldLabel htmlFor="lastName">{t("common.lastName")}</FieldLabel>
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
              <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
              <Input id="email" value={user.email} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                {t("profile.emailLocked")}
              </p>
            </Field>

            {saved && (
              <p
                role="status"
                className="flex items-center gap-2.5 rounded-lg border border-success/40 bg-success/10 px-3 py-2.5 text-sm text-success"
              >
                <Check className="size-4 shrink-0" aria-hidden="true" />
                {t("profile.saved")}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="self-start"
              loading={updateProfile.isPending}
              disabled={!hasChanges}
            >
              {t("common.saveChanges")}
            </Button>
          </FieldGroup>
        </form>
      </section>

      <section
        aria-label={t("profile.security.section")}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="text-lg font-semibold">
          {t("profile.security.title")}
        </h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          {t("profile.security.hint")}
        </p>
        <div className="max-w-md">
          <ChangePasswordForm
            currentLabel={t("profile.security.currentLabel")}
            differentRuleLabel={t("profile.security.differentRule")}
            submitLabel={t("profile.security.submit")}
            successMessage={t("profile.security.success")}
          />
        </div>
      </section>
    </div>
  );
}
