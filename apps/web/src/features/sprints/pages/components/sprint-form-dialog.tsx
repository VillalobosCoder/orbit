import { useState, type SubmitEvent } from "react";
import { CircleAlert, Clock } from "lucide-react";

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
import { useCreateSprint, useUpdateSprint } from "@/features/sprints/api/queries";
import type { ProjectDto, SaveSprintRequestDto, SprintDto } from "@orbit/shared";
import { countDays } from "../utils/format-date";

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
  const [startDate, setStartDate] = useState(sprint?.startDate ?? "");
  const [endDate, setEndDate] = useState(sprint?.endDate ?? "");
  const hasInvalidRange = Boolean(startDate && endDate && endDate < startDate);
  const days = hasInvalidRange ? null : countDays(startDate || null, endDate || null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasInvalidRange) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const goal = formData.get("goal");

    if (typeof name !== "string" || typeof goal !== "string") {
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
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar sprint" : "Nuevo sprint"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Modifica los datos de ${sprint.name}.`
                : "Nace como «Planeado». Solo puede haber un sprint activo a la vez."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-5">
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
              <Label htmlFor="goal">
                Objetivo
                <span className="font-normal text-muted-foreground">
                  opcional
                </span>
              </Label>
              <Textarea
                id="goal"
                name="goal"
                defaultValue={sprint?.goal ?? ""}
                maxLength={1000}
                rows={3}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="startDate">Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.currentTarget.value)}
                />
              </Field>
              <Field>
                <Label htmlFor="endDate">Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  aria-invalid={hasInvalidRange || undefined}
                  onChange={(event) => setEndDate(event.currentTarget.value)}
                />
              </Field>
            </div>
            {hasInvalidRange ? (
              <p
                role="alert"
                className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                La fecha de fin no puede ser anterior a la de inicio.
              </p>
            ) : (
              days !== null && (
                <p className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                  <Clock className="size-4 shrink-0 text-info" aria-hidden="true" />
                  Duración: {days} {days === 1 ? "día" : "días"}
                </p>
              )
            )}
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
            <Button type="submit" disabled={mutation.isPending || hasInvalidRange}>
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
