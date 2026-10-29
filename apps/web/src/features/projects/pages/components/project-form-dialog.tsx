import { useState, type SubmitEvent } from "react";
import { CircleAlert, Lock } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateProject,
  useUpdateProject,
} from "@/features/projects/api/queries";
import type { ProjectDto, UpdateProjectRequestDto } from "@orbit/shared";

interface ProjectFormDialogProps {
  project?: ProjectDto;
  onClose: () => void;
  /** Se llama con el proyecto recién creado, antes de cerrar. */
  onCreated?: (project: ProjectDto) => void;
}

export default function ProjectFormDialog({
  project,
  onClose,
  onCreated,
}: ProjectFormDialogProps) {
  const isEditing = project !== undefined;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const mutation = isEditing ? updateProject : createProject;
  const [projectKey, setProjectKey] = useState(project?.projectKey ?? "");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const description = formData.get("description");

    if (typeof name !== "string" || typeof description !== "string") {
      return;
    }

    const input: UpdateProjectRequestDto = { name, description };

    if (isEditing) {
      updateProject.mutate({ id: project.id, ...input }, { onSuccess: onClose });
    } else {
      createProject.mutate(
        { ...input, projectKey },
        {
          onSuccess: (created) => {
            if (created) onCreated?.(created);
            onClose();
          },
        },
      );
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar proyecto" : "Nuevo proyecto"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Cambia el nombre o la descripción. La clave es permanente."
                : "Serás el propietario y el primer miembro. Nace con las columnas y los tipos de issue por defecto."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <Field>
                <Label htmlFor="projectKey">Clave</Label>
                <div className="relative">
                  <Input
                    id="projectKey"
                    value={projectKey}
                    onChange={(event) =>
                      setProjectKey(
                        event.currentTarget.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, ""),
                      )
                    }
                    disabled={isEditing}
                    minLength={2}
                    maxLength={10}
                    autoComplete="off"
                    className="pr-9 font-mono tracking-wider uppercase"
                    required
                  />
                  {isEditing && (
                    <Lock
                      aria-label="Solo lectura"
                      className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isEditing ? "Inmutable" : "2–10 letras o números"}
                </p>
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
            </div>
            {!isEditing && (
              <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                <span className="font-mono text-info">
                  {projectKey || "CLAVE"}-1
                </span>
                Así se verán las claves de tus issues. No se podrá cambiar
                después.
              </p>
            )}
            <Field>
              <Label htmlFor="description">
                Descripción
                <span className="font-normal text-muted-foreground">
                  opcional
                </span>
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={project?.description ?? ""}
                maxLength={1000}
                rows={3}
              />
            </Field>
            {mutation.isError && (
              <p
                role="alert"
                className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
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
