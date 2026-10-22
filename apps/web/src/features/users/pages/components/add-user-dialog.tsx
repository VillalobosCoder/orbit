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
import type { CreateUserRequestDto } from "@orbit/shared";

export default function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const createUser = useCreateUser();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTemporaryPassword(null);
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

    const input: CreateUserRequestDto = { name, lastName, email };
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
                  maxLength={30}
                  autoComplete="email"
                  required
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Creando usuario..." : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
