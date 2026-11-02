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
import {
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
  type ProjectDto,
  type UpdateProjectRequestDto,
} from "@orbit/shared";
import { useI18n } from "@/i18n/use-i18n";

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
  const { t } = useI18n();
  const isEditing = project !== undefined;
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const mutation = isEditing ? updateProject : createProject;
  const [projectKey, setProjectKey] = useState(project?.projectKey ?? "");
  const [description, setDescription] = useState(project?.description ?? "");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    if (typeof name !== "string") {
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
              {t(isEditing ? "projects.form.editTitle" : "projects.form.newTitle")}
            </DialogTitle>
            <DialogDescription>
              {t(
                isEditing
                  ? "projects.form.editDescription"
                  : "projects.form.newDescription",
              )}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <Field>
                <Label htmlFor="projectKey">{t("projects.form.key")}</Label>
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
                      aria-label={t("projects.form.keyReadOnly")}
                      className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(isEditing ? "projects.form.keyImmutable" : "projects.form.keyHint")}
                </p>
              </Field>
              <Field>
                <Label htmlFor="name">{t("common.name")}</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={project?.name}
                  minLength={2}
                  maxLength={PROJECT_NAME_MAX_LENGTH}
                  required
                />
              </Field>
            </div>
            {!isEditing && (
              <p className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                <span className="font-mono text-info">
                  {projectKey || t("projects.form.keyPlaceholder")}-1
                </span>
                {t("projects.form.keyPreview")}
              </p>
            )}
            <Field>
              <Label htmlFor="description">
                {t("projects.form.description")}
                <span className="font-normal text-muted-foreground">
                  {t("common.optional")}
                </span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
                maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
                className="h-28 resize-none"
              />
              <span className="self-end text-xs text-muted-foreground">
                {description.length} / {PROJECT_DESCRIPTION_MAX_LENGTH}
              </span>
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
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {isEditing
                ? mutation.isPending
                  ? t("common.saving")
                  : t("common.saveChanges")
                : mutation.isPending
                  ? t("projects.form.creating")
                  : t("projects.form.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
