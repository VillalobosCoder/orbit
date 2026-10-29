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
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateIssue, useUpdateIssue } from "@/features/issues/api/queries";
import { UserAvatarComponent } from "@/shared/ui/custom-components/user-avatar-component";
import {
  BoardColumnCategory,
  type BoardColumnDto,
  type IssueDto,
  type IssueOptionsDto,
  type ProjectDto,
  type ProjectMemberDto,
  type SaveIssueRequestDto,
  type SprintDto,
} from "@orbit/shared";

interface IssueFormDialogProps {
  project: ProjectDto;
  options: IssueOptionsDto;
  columns: BoardColumnDto[];
  issues: IssueDto[];
  sprints: SprintDto[];
  defaultSprintId?: number | null;
  members: ProjectMemberDto[];
  issue?: IssueDto;
  defaults?: { typeId?: number; parentId?: number };
  onClose: () => void;
}

export default function IssueFormDialog({
  project,
  options,
  columns,
  issues,
  sprints,
  defaultSprintId = null,
  members,
  issue,
  defaults,
  onClose,
}: IssueFormDialogProps) {
  const isEditing = issue !== undefined;
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  const mutation = isEditing ? updateIssue : createIssue;
  const [typeId, setTypeId] = useState<number>(
    issue?.typeId ?? defaults?.typeId ?? options.issueTypes[0]?.id ?? 0,
  );
  const isSubtask =
    options.issueTypes.find((type) => type.id === typeId)?.isSubtask ?? false;
  const parentCandidates = issues.filter(
    (candidate) =>
      candidate.id !== issue?.id &&
      candidate.parentId === null &&
      !options.issueTypes.find((type) => type.id === candidate.typeId)
        ?.isSubtask,
  );
  const [assigneeIds, setAssigneeIds] = useState<number[]>(
    issue?.assigneeIds ?? [],
  );

  function toggleAssignee(userId: number, checked: boolean) {
    setAssigneeIds((current) =>
      checked ? [...current, userId] : current.filter((id) => id !== userId),
    );
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title");
    const description = formData.get("description");
    const parentId = formData.get("parentId");
    const priorityId = formData.get("priorityId");
    const difficultyId = formData.get("difficultyId");
    const columnId = formData.get("columnId");
    const sprintId = formData.get("sprintId");

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof priorityId !== "string" ||
      typeof difficultyId !== "string" ||
      typeof columnId !== "string" ||
      (isSubtask && typeof parentId !== "string")
    ) {
      return;
    }

    const input: SaveIssueRequestDto = {
      title,
      description,
      typeId,
      parentId: isSubtask && parentId ? Number(parentId) : null,
      priorityId: priorityId ? Number(priorityId) : null,
      difficultyId: difficultyId ? Number(difficultyId) : null,
      columnId: Number(columnId),
      sprintId: isSubtask ? undefined : sprintId ? Number(sprintId) : null,
      assigneeIds,
    };

    if (isEditing) {
      updateIssue.mutate(
        { id: project.id, issueId: issue.id, ...input },
        { onSuccess: onClose },
      );
    } else {
      createIssue.mutate(
        { id: project.id, ...input },
        { onSuccess: onClose },
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Editar ${issue.issueKey}` : "Nuevo issue"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del issue."
                : `Se creará en ${project.projectKey} · ${project.name}.`}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-5">
            <Field>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                defaultValue={issue?.title}
                maxLength={255}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={issue?.description ?? ""}
                maxLength={20000}
                rows={4}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <Label htmlFor="typeId">Tipo</Label>
                <NativeSelect
                  id="typeId"
                  name="typeId"
                  value={typeId}
                  onChange={(event) =>
                    setTypeId(Number(event.currentTarget.value))
                  }
                  required
                >
                  {options.issueTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <Label htmlFor="columnId">Estado</Label>
                <NativeSelect
                  id="columnId"
                  name="columnId"
                  defaultValue={
                    issue?.columnId ??
                    columns.find(
                      (column) => column.category === BoardColumnCategory.TODO,
                    )?.id
                  }
                  required
                >
                  {columns.map((column) => (
                    <option key={column.id} value={column.id}>
                      {column.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              {isSubtask && (
                <Field className="sm:col-span-2">
                  <Label htmlFor="parentId">Issue padre</Label>
                  <NativeSelect
                    id="parentId"
                    name="parentId"
                    defaultValue={issue?.parentId ?? defaults?.parentId ?? ""}
                    required
                  >
                    <option value="">Selecciona un issue</option>
                    {parentCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.issueKey} · {candidate.title}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              )}
              <Field>
                <Label htmlFor="priorityId">Prioridad</Label>
                <NativeSelect
                  id="priorityId"
                  name="priorityId"
                  defaultValue={issue?.priorityId ?? ""}
                >
                  <option value="">Sin prioridad</option>
                  {options.priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <Label htmlFor="difficultyId">Dificultad</Label>
                <NativeSelect
                  id="difficultyId"
                  name="difficultyId"
                  defaultValue={issue?.difficultyId ?? ""}
                >
                  <option value="">Sin estimar</option>
                  {options.difficulties.map((difficulty) => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              {!isSubtask && (
                <Field className="sm:col-span-2">
                  <Label htmlFor="sprintId">Sprint</Label>
                  <NativeSelect
                    id="sprintId"
                    name="sprintId"
                    defaultValue={
                      isEditing
                        ? (issue.sprintId ?? "")
                        : (defaultSprintId ?? "")
                    }
                  >
                    <option value="">Backlog</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              )}
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">
                Responsables
                <span className="ml-2 font-normal text-muted-foreground">
                  {assigneeIds.length} seleccionados
                </span>
              </legend>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                {members.map((member) => {
                  const fullName = `${member.name} ${member.lastName}`;

                  return (
                    <label
                      key={member.id}
                      className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 text-sm last:border-b-0 hover:bg-accent/50"
                    >
                      <Checkbox
                        aria-label={fullName}
                        checked={assigneeIds.includes(member.id)}
                        onCheckedChange={(checked) =>
                          toggleAssignee(member.id, checked)
                        }
                      />
                      <UserAvatarComponent
                        name={fullName}
                        className="size-6 text-[0.625rem]"
                      />
                      <span className="flex-1 truncate">{fullName}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

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
                  ? "Creando issue..."
                  : "Crear issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
