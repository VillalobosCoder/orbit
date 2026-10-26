import type { SubmitEvent } from "react";

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
import {
  useCreateProject,
  useUpdateProject,
} from "@/features/projects/api/queries";
import type { ProjectDto, UpdateProjectRequestDto } from "@orbit/shared";

interface ProjectFormDialogProps {
  project?: ProjectDto;
  onClose: () => void;
}

export default function ProjectFormDialog({
  project,
  onClose,
}: ProjectFormDialogProps) {
  const isEditing = project !== undefined;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const mutation = isEditing ? updateProject : createProject;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const description = formData.get("description");
    const projectKey = formData.get("projectKey");

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof projectKey !== "string"
    ) {
      return;
    }

    const input: UpdateProjectRequestDto = { name, description };

    if (isEditing) {
      updateProject.mutate({ id: project.id, ...input }, { onSuccess: onClose });
    } else {
      createProject.mutate({ ...input, projectKey }, { onSuccess: onClose });
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar proyecto" : "Agregar proyecto"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Modifica los datos de ${project.name}.`
                : "La clave no se podrá cambiar después y formará los identificadores de los issues (por ejemplo WEB-123)."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="projectKey">Clave</Label>
              <Input
                id="projectKey"
                name="projectKey"
                defaultValue={project?.projectKey}
                readOnly={isEditing}
                minLength={2}
                maxLength={10}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                defaultValue={project?.name}
                minLength={2}
                maxLength={100}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                defaultValue={project?.description ?? ""}
                maxLength={1000}
              />
            </Field>
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
            <Button type="submit" disabled={mutation.isPending}>
              {isEditing
                ? mutation.isPending
                  ? "Guardando..."
                  : "Guardar cambios"
                : mutation.isPending
                  ? "Creando proyecto..."
                  : "Crear proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
