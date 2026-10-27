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
import { useCreateSprint, useUpdateSprint } from "@/features/sprints/api/queries";
import type { ProjectDto, SaveSprintRequestDto, SprintDto } from "@orbit/shared";

interface SprintFormDialogProps {
  project: ProjectDto;
  /** Sin `sprint` el diálogo crea un sprint; con `sprint` lo edita. */
  sprint?: SprintDto;
  onClose: () => void;
}

export default function SprintFormDialog({
  project,
  sprint,
  onClose,
}: SprintFormDialogProps) {
  const isEditing = sprint !== undefined;
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const mutation = isEditing ? updateSprint : createSprint;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const goal = formData.get("goal");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");

    if (
      typeof name !== "string" ||
      typeof goal !== "string" ||
      typeof startDate !== "string" ||
      typeof endDate !== "string"
    ) {
      return;
    }

    const input: SaveSprintRequestDto = {
      name,
      goal,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    if (isEditing) {
      updateSprint.mutate(
        { id: project.id, sprintId: sprint.id, ...input },
        { onSuccess: onClose },
      );
    } else {
      createSprint.mutate({ id: project.id, ...input }, { onSuccess: onClose });
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
              {isEditing ? "Editar sprint" : "Nuevo sprint"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Modifica los datos de ${sprint.name}.`
                : `Se creará en ${project.projectKey}, sin iniciar.`}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                defaultValue={sprint?.name}
                maxLength={100}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="goal">Objetivo</Label>
              <Input
                id="goal"
                name="goal"
                defaultValue={sprint?.goal ?? ""}
                maxLength={1000}
              />
            </Field>
            <Field>
              <Label htmlFor="startDate">Inicio</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={sprint?.startDate ?? ""}
              />
            </Field>
            <Field>
              <Label htmlFor="endDate">Fin</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={sprint?.endDate ?? ""}
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
                  ? "Creando sprint..."
                  : "Crear sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
