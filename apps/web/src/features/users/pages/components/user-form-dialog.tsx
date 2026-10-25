import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
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
import { useGetModules } from "@/features/modules/api/queries";
import {
  useCreateUser,
  useGetUser,
  useUpdateUser,
} from "@/features/users/api/queries";
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
      <DialogContent className="sm:max-w-sm">
        {isEditing && userQuery.isPending && <p>Cargando usuario...</p>}
        {isEditing && userQuery.isError && (
          <p role="alert">{userQuery.error.message}</p>
        )}
        {(!isEditing || userQuery.data) && (
          <UserForm user={userQuery.data} isSelf={isSelf} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
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
    setPermissions((current) => ({
      ...current,
      [module]: {
        canRead: current[module]?.canRead ?? false,
        canWrite: current[module]?.canWrite ?? false,
        [flag]: value,
      },
    }));
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
      <>
        <DialogHeader>
          <DialogTitle>Usuario creado</DialogTitle>
          <DialogDescription>
            Comparte esta contraseña temporal con el usuario. No se volverá a
            mostrar después de cerrar este diálogo.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <Label htmlFor="temporaryPassword">Contraseña temporal</Label>
          <Input
            id="temporaryPassword"
            value={temporaryPassword}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
          />
        </Field>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Listo
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar usuario" : "Agregar usuario"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? `Modifica los datos de ${user.name} ${user.lastName}.`
            : "Ingresa los datos de la persona. El sistema generará una contraseña temporal."}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup className="py-4">
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
          <p className="text-sm text-muted-foreground">
            No puedes modificar tus propios permisos.
          </p>
        ) : (
          <fieldset className="max-h-56 space-y-3 overflow-y-auto">
            <legend className="mb-2 text-sm font-medium">
              Permisos de acceso
            </legend>
            {modulesQuery.isPending && (
              <p className="text-sm text-muted-foreground">
                Cargando módulos...
              </p>
            )}
            {modulesQuery.isError && (
              <p className="text-sm text-destructive" role="alert">
                No se pudieron cargar los módulos. Intenta de nuevo antes de
                guardar.
              </p>
            )}
            {modulesQuery.data?.map((module) => {
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
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-md border border-border px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm">{label}</span>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={flags.canRead}
                      onChange={(event) =>
                        setFlag(module.key, "canRead", event.currentTarget.checked)
                      }
                    />
                    Leer
                  </label>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={flags.canWrite}
                      onChange={(event) =>
                        setFlag(module.key, "canWrite", event.currentTarget.checked)
                      }
                    />
                    Escribir
                  </label>
                </div>
              );
            })}
          </fieldset>
        )}
        {mutation.isError && (
          <p className="text-sm text-destructive" role="alert">
            {mutation.error.message}
          </p>
        )}
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
