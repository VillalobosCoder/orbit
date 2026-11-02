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
import {
  SPRINT_GOAL_MAX_LENGTH,
  SPRINT_NAME_MAX_LENGTH,
  type ProjectDto,
  type SaveSprintRequestDto,
  type SprintDto,
} from "@orbit/shared";
import { countDays } from "../utils/format-date";
import { useI18n } from "@/i18n/use-i18n";

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
  const { t } = useI18n();
  const isEditing = sprint !== undefined;
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();
  const mutation = isEditing ? updateSprint : createSprint;
  const [goal, setGoal] = useState(sprint?.goal ?? "");
  const [startDate, setStartDate] = useState(sprint?.startDate ?? "");
  const [endDate, setEndDate] = useState(sprint?.endDate ?? "");
  const hasInvalidRange = Boolean(startDate && endDate && endDate < startDate);
  const days = hasInvalidRange ? null : countDays(startDate || null, endDate || null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasInvalidRange) return;

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    if (typeof name !== "string") {
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
              {t(isEditing ? "sprints.form.editTitle" : "sprints.form.newTitle")}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? t("sprints.form.editDescription", { name: sprint.name })
                : t("sprints.form.newDescription")}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-5">
            <Field>
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={sprint?.name}
                maxLength={SPRINT_NAME_MAX_LENGTH}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="goal">
                {t("sprints.form.goal")}
                <span className="font-normal text-muted-foreground">
                  {t("common.optional")}
                </span>
              </Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(event) => setGoal(event.currentTarget.value)}
                maxLength={SPRINT_GOAL_MAX_LENGTH}
                className="h-28 resize-none"
              />
              <span className="self-end text-xs text-muted-foreground">
                {goal.length} / {SPRINT_GOAL_MAX_LENGTH}
              </span>
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="startDate">{t("sprints.form.startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.currentTarget.value)}
                />
              </Field>
              <Field>
                <Label htmlFor="endDate">{t("sprints.form.endDate")}</Label>
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
                {t("sprints.form.invalidRange")}
              </p>
            ) : (
              days !== null && (
                <p className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                  <Clock className="size-4 shrink-0 text-info" aria-hidden="true" />
                  {t("sprints.form.duration", { count: days })}
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending || hasInvalidRange}>
              {isEditing
                ? mutation.isPending
                  ? t("common.saving")
                  : t("common.saveChanges")
                : mutation.isPending
                  ? t("sprints.form.creating")
                  : t("sprints.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
