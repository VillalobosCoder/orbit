import { useState, type SubmitEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUser } from "@/features/users/api/queries";
import { useGetModules } from "@/features/modules/api/queries";
import type { CreateUserRequestDto, UserPermissionDto } from "@orbit/shared";

export default function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, Pick<UserPermissionDto, "canRead" | "canWrite">>
  >({});
  const createUser = useCreateUser();
  const modulesQuery = useGetModules();
  const temporaryPassword = createUser.data?.temporaryPassword;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedPermissions({});
      createUser.reset();
    }
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

    const input: CreateUserRequestDto = {
      name,
      lastName,
      email,
      permissions: Object.entries(selectedPermissions)
        .filter(([, permission]) => permission.canRead || permission.canWrite)
        .map(([module, permission]) => ({ module, ...permission })),
    };
    createUser.mutate(input);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button type="button" variant="outline">Nuevo usuario</Button>}
      />
      <DialogContent className="sm:max-w-sm">
        {temporaryPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Usuario creado</DialogTitle>
              <DialogDescription>
                Comparte esta contraseña temporal con el usuario. No se volverá
                a mostrar después de cerrar este diálogo.
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
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Listo
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Agregar usuario</DialogTitle>
              <DialogDescription>
                Ingresa los datos de la persona. El sistema generará una
                contraseña temporal.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
              <Field>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" minLength={2} maxLength={50} required />
              </Field>
              <Field>
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
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
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </Field>
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
                    No se pudieron cargar los módulos. Intenta de nuevo antes
                    de crear el usuario.
                  </p>
                )}
                {modulesQuery.data?.map((module) => {
                  const permission = selectedPermissions[module.key] ?? {
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
                          checked={permission.canRead}
                          onChange={(event) => {
                            const canRead = event.currentTarget.checked;
                            setSelectedPermissions((current) => ({
                              ...current,
                              [module.key]: {
                                canRead,
                                canWrite:
                                  current[module.key]?.canWrite ?? false,
                              },
                            }));
                          }}
                        />
                        Leer
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={permission.canWrite}
                          onChange={(event) => {
                            const canWrite = event.currentTarget.checked;
                            setSelectedPermissions((current) => ({
                              ...current,
                              [module.key]: {
                                canRead:
                                  current[module.key]?.canRead ?? false,
                                canWrite,
                              },
                            }));
                          }}
                        />
                        Escribir
                      </label>
                    </div>
                  );
                })}
              </fieldset>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createUser.isPending ||
                  modulesQuery.isPending ||
                  modulesQuery.isError
                }
              >
                {createUser.isPending ? "Creando usuario..." : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
