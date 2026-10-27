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
import { useCreateIssue, useUpdateIssue } from "@/features/issues/api/queries";
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
  /** Sprints a los que se puede asignar (planeados o activo). */
  sprints: SprintDto[];
  /** Sprint preseleccionado al crear; nulo es el backlog. */
  defaultSprintId?: number | null;
  members: ProjectMemberDto[];
  /** Sin `issue` el diálogo crea un issue; con `issue` lo edita. */
  issue?: IssueDto;
  /** Valores iniciales al crear, por ejemplo una subtarea de un issue. */
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
      // Las subtareas siguen el sprint de su padre.
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
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Editar ${issue.issueKey}` : "Nuevo issue"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del issue."
                : `Se creará en ${project.projectKey}.`}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
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
              <textarea
                id="description"
                name="description"
                defaultValue={issue?.description ?? ""}
                maxLength={20000}
                rows={4}
                className="rounded-md border border-border bg-transparent px-3 py-2 text-sm"
              />
            </Field>
            <Field>
              <Label htmlFor="columnId">Estado</Label>
              <select
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
              </select>
            </Field>
            <Field>
              <Label htmlFor="typeId">Tipo</Label>
              <select
                id="typeId"
                name="typeId"
                value={typeId}
                onChange={(event) => setTypeId(Number(event.currentTarget.value))}
                required
              >
                {options.issueTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </Field>
            {isSubtask && (
              <Field>
                <Label htmlFor="parentId">Issue padre</Label>
                <select
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
                </select>
              </Field>
            )}
            <Field>
              <Label htmlFor="priorityId">Prioridad</Label>
              <select
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
              </select>
            </Field>
            {!isSubtask && (
              <Field>
                <Label htmlFor="sprintId">Sprint</Label>
                <select
                  id="sprintId"
                  name="sprintId"
                  defaultValue={
                    isEditing ? (issue.sprintId ?? "") : (defaultSprintId ?? "")
                  }
                >
                  <option value="">Backlog</option>
                  {sprints.map((sprint) => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field>
              <Label htmlFor="difficultyId">Dificultad</Label>
              <select
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
              </select>
            </Field>
            <fieldset className="max-h-32 space-y-1 overflow-y-auto">
              <legend className="mb-1 text-sm font-medium">Responsables</legend>
              {members.map((member) => (
                <label key={member.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={assigneeIds.includes(member.id)}
                    onChange={(event) =>
                      toggleAssignee(member.id, event.currentTarget.checked)
                    }
                  />
                  {member.name} {member.lastName}
                </label>
              ))}
            </fieldset>
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
                  ? "Creando issue..."
                  : "Crear issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
