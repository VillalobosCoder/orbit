import { useState, type SubmitEvent } from "react";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useGetModules } from "@/features/modules/api/queries";
import {
  useCreateUser,
  useGetUser,
  useUpdateUser,
} from "@/features/users/api/queries";
import TemporaryPassword from "./temporary-password";
import type {
  SaveUserRequestDto,
  UserDetailDto,
  UserPermissionDto,
} from "@orbit/shared";

type PermissionFlags = Pick<UserPermissionDto, "canRead" | "canWrite">;

interface UserFormDialogProps {
  /** Sin `userId` el diálogo crea un usuario; con `userId` lo edita. */
  userId?: number;
  isSelf?: boolean;
  onClose: () => void;
}

export default function UserFormDialog({
  userId,
  isSelf = false,
  onClose,
}: UserFormDialogProps) {
  const isEditing = userId !== undefined;
  const userQuery = useGetUser(isEditing ? userId : null);

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        {isEditing && userQuery.isPending && (
          <p
            role="status"
            className="flex items-center gap-2 py-6 text-sm text-muted-foreground"
          >
            <Spinner />
          </p>
        )}
        {isEditing && userQuery.isError && (
          <ErrorMessage>{userQuery.error.message}</ErrorMessage>
        )}
        {(!isEditing || userQuery.data) && (
          <UserForm user={userQuery.data} isSelf={isSelf} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </div>
  );
}

function UserForm({
  user,
  isSelf,
  onClose,
}: {
  user?: UserDetailDto;
  isSelf: boolean;
  onClose: () => void;
}) {
  const isEditing = user !== undefined;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const mutation = isEditing ? updateUser : createUser;
  const modulesQuery = useGetModules();
  const [permissions, setPermissions] = useState<
    Record<string, PermissionFlags>
  >(() =>
    Object.fromEntries(
      (user?.permissions ?? []).map(({ module, canRead, canWrite }) => [
        module,
        { canRead, canWrite },
      ]),
    ),
  );
  const temporaryPassword = createUser.data?.temporaryPassword;

  function setFlag(module: string, flag: keyof PermissionFlags, value: boolean) {
    setPermissions((current) => {
      const previous = current[module] ?? { canRead: false, canWrite: false };
      const next = { ...previous, [flag]: value };

      if (flag === "canWrite" && value) next.canRead = true;
      if (flag === "canRead" && !value) next.canWrite = false;

      return { ...current, [module]: next };
    });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const lastName = formData.get("lastName");
    const email = formData.get("email");

    if (
      typeof name !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string"
    ) {
      return;
    }

    const input: SaveUserRequestDto = {
      name,
      lastName,
      email,
      permissions: isSelf
        ? undefined
        : Object.entries(permissions)
            .filter(([, flags]) => flags.canRead || flags.canWrite)
            .map(([module, flags]) => ({ module, ...flags })),
    };

    if (isEditing) {
      updateUser.mutate({ id: user.id, ...input }, { onSuccess: onClose });
    } else {
      createUser.mutate(input);
    }
  }

  if (temporaryPassword) {
    return (
      <TemporaryPassword
        title="Usuario creado"
        description="Comparte esta contraseña temporal con el usuario. No se volverá a mostrar después de cerrar este diálogo."
        password={temporaryPassword}
        onClose={onClose}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar usuario" : "Nuevo usuario"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? `Modifica los datos y permisos de ${user.name} ${user.lastName}.`
            : "Ingresa los datos de la persona. El sistema generará una contraseña temporal que verás una sola vez."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name}
              minLength={2}
              maxLength={50}
              required
            />
          </Field>
          <Field>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={user?.lastName}
              minLength={2}
              maxLength={50}
              required
            />
          </Field>
        </div>
        <Field>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email}
            maxLength={254}
            autoComplete="email"
            required
          />
        </Field>

        {isSelf ? (
          <p className="rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
            No puedes modificar tus propios permisos.
          </p>
        ) : (
          <fieldset className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <legend className="text-sm font-medium">
                Permisos por módulo
              </legend>
              <span className="text-xs text-muted-foreground">
                Escribir incluye leer
              </span>
            </div>
            {modulesQuery.isPending && (
              <p
                role="status"
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Spinner />
                Cargando módulos...
              </p>
            )}
            {modulesQuery.isError && (
              <ErrorMessage>
                No se pudieron cargar los módulos. Intenta de nuevo antes de
                guardar.
              </ErrorMessage>
            )}
            {modulesQuery.data && (
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                <div className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] items-center bg-muted/60 px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span>Módulo</span>
                  <span className="text-center">Leer</span>
                  <span className="text-center">Escribir</span>
                </div>
                {modulesQuery.data.map((module) => {
                  const flags = permissions[module.key] ?? {
                    canRead: false,
                    canWrite: false,
                  };
                  const parentName = modulesQuery.data.find(
                    (item) => item.key === module.parentKey,
                  )?.name;
                  const label = parentName
                    ? `${parentName} · ${module.name}`
                    : module.name;

                  return (
                    <div
                      key={module.key}
                      className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] items-center border-t border-border px-4 py-3"
                    >
                      <span className="min-w-0 truncate text-sm font-medium">
                        {label}
                      </span>
                      <span className="flex justify-center">
                        <Checkbox
                          aria-label={`${label}: leer`}
                          checked={flags.canRead}
                          onCheckedChange={(checked) =>
                            setFlag(module.key, "canRead", checked)
                          }
                        />
                      </span>
                      <span className="flex justify-center">
                        <Checkbox
                          aria-label={`${label}: escribir`}
                          checked={flags.canWrite}
                          onCheckedChange={(checked) =>
                            setFlag(module.key, "canWrite", checked)
                          }
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </fieldset>
        )}
        {mutation.isError && <ErrorMessage>{mutation.error.message}</ErrorMessage>}
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            mutation.isPending ||
            (!isSelf && (modulesQuery.isPending || modulesQuery.isError))
          }
        >
          {isEditing
            ? mutation.isPending
              ? "Guardando..."
              : "Guardar cambios"
            : mutation.isPending
              ? "Creando usuario..."
              : "Crear usuario"}
        </Button>
      </DialogFooter>
    </form>
  );
}
