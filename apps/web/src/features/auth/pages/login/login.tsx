import { useState } from "react";
import { CircleAlert, Eye, EyeOff, Orbit } from "lucide-react";
import type { LoginRequestDto } from "@orbit/shared";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth/use-auth";
import { useLogin } from "@/features/auth/api/queries";

export default function Login() {
  const { isLoading, sessionError } = useAuth();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

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
          Tu equipo, en la misma órbita.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Proyectos, tableros y sprints en un solo lugar. Inicia sesión con la
          cuenta que te creó tu administrador.
        </p>
      </section>

      <main className="w-full max-w-md flex-1 basis-96">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <div>
            <h2 className="text-xl font-semibold">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bienvenido de vuelta.
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
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    aria-invalid={errorMessage ? true : undefined}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      placeholder="********"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-11"
                      aria-invalid={errorMessage ? true : undefined}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </Field>

                {errorMessage && (
                  <div
                    role="alert"
                    className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  >
                    <CircleAlert
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {errorMessage}
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? <Spinner /> : "Iniciar sesión"}
                </Button>
              </FieldGroup>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿Sin cuenta o sin acceso? Pide a un administrador que la cree.
          </p>
        </div>
      </main>
    </div>
  );
}
