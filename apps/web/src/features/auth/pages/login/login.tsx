import { Orbit } from "lucide-react";
import type { LoginRequestDto } from "@orbit/shared";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth/use-auth";
import { useLogin } from "@/features/auth/api/queries";
import { useI18n } from "@/i18n/use-i18n";

export default function Login() {
  const { t } = useI18n();
  const { isLoading, sessionError } = useAuth();
  const loginMutation = useLogin();

  const errorMessage =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : sessionError;

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") return;

    const credentials: LoginRequestDto = { email, password };
    loginMutation.mutate(credentials);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-12 lg:justify-between">
      <section className="max-w-md flex-1 basis-80">
        <div className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Orbit className="size-9 text-primary" aria-hidden="true" />
          Orbit
        </div>
        <h1 className="mt-7 text-4xl leading-tight font-bold tracking-tight">
          {t("auth.login.tagline")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {t("auth.login.intro")}
        </p>
      </section>

      <main className="w-full max-w-md flex-1 basis-96">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <div>
            <h2 className="text-xl font-semibold">{t("auth.login.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("auth.login.welcomeBack")}
            </p>
          </div>

          {isLoading ? (
            <p
              role="status"
              className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Spinner />
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">{t("common.email")}</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    aria-invalid={errorMessage ? true : undefined}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">{t("common.password")}</FieldLabel>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="********"
                    autoComplete="current-password"
                    aria-invalid={errorMessage ? true : undefined}
                    required
                  />
                </Field>

                <Button
                  className="w-full"
                  size="lg"
                  type="submit"
                  loading={loginMutation.isPending}
                >
                  {t("auth.login.submit")}
                </Button>
              </FieldGroup>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t("auth.login.noAccess")}
          </p>
        </div>
      </main>
    </div>
  );
}
