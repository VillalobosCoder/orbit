import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth/use-auth";
import { useLogin, useLogout } from "@/features/auth/api/queries";
import type { LoginRequestDto } from "@orbit/shared";

export default function Login() {
  const { user, isLoading, sessionError } = useAuth();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

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
    <Card>
      <CardHeader>
        <CardTitle>Orbit</CardTitle>
        <CardDescription>
          {isLoading
            ? "Verificando sesión..."
            : user
              ? `Sesión iniciada como ${user.email}`
              : "Inicia sesión para continuar"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p role="status" className="text-sm text-muted-foreground">
            Verificando sesión...
          </p>
        ) : user ? (
          <div className="space-y-4">
            <p>¡Bienvenido, {user.name}!</p>
            <Button
              className="w-full"
              type="button"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              {logoutMutation.isPending
                ? "Cerrando sesión..."
                : "Cerrar sesión"}
            </Button>
            <FieldError>{logoutMutation.error?.message}</FieldError>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <FieldError>{sessionError}</FieldError>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <FieldError>{loginMutation.error?.message}</FieldError>
              <Button
                className="w-full"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending
                  ? "Iniciando sesión..."
                  : "Iniciar sesión"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
