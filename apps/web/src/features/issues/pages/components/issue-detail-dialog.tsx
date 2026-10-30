import { useState, type ReactNode } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { CircleCheck, Circle, CornerDownRight, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import IssueComments from "@/features/comments/pages/components/issue-comments";
import {
  useGetProject,
  useGetProjectMembers,
} from "@/features/projects/api/queries";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import {
  BoardColumnCategory,
  SprintStatus,
  type IssueDto,
} from "@orbit/shared";
import {
  useDeleteIssue,
  useGetBoard,
  useGetIssueOptions,
} from "../../api/queries";
import { useGetPlanning } from "@/features/sprints/api/queries";
import IssueFormDialog from "./issue-form-dialog";
import { AssigneeStack, IssueTypeIcon, PriorityIcon } from "./issue-visuals";

type DialogState = {
  issue?: IssueDto;
  defaults?: { typeId?: number; parentId?: number };
} | null;

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 text-sm">{children}</dd>
    </div>
  );
}

export default function IssueDetailDialog() {
  const params = useParams();
  const projectId = Number(params.id);
  const issueId = Number(params.issueId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canWrite } = usePermission("projects");
  const project = useGetProject(projectId);
  const board = useGetBoard(projectId);
  const options = useGetIssueOptions(projectId);
  const members = useGetProjectMembers(projectId);
  const planning = useGetPlanning(projectId);
  const deleteIssue = useDeleteIssue();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const close = () => navigate(`/projects/${projectId}`);

  const shell = (title: string, content: ReactNode) => (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        {content ?? (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Spinner />
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Cargando los datos del issue.
            </DialogDescription>
          </DialogHeader>
        )}
      </DialogContent>
    </Dialog>
  );

  if (project.isLoading || board.isLoading) {
    return shell("Cargando issue...", null);
  }
  if (project.isError || board.isError) {
    return shell(
      "No se pudo cargar el issue",
      <p role="alert" className="text-sm text-destructive">
        {(project.error ?? board.error)?.message}
      </p>,
    );
  }
  if (!project.data || !board.data) return null;

  const { columns, issues } = board.data;
  const issue = issues.find((item) => item.id === issueId);

  if (!issue) {
    return shell(
      "Issue no encontrado",
      <p role="alert" className="text-sm text-destructive">
        Este issue no existe o fue eliminado.
      </p>,
    );
  }

  const column = columns.find((item) => item.id === issue.columnId);
  const sprints = planning.data?.sprints ?? [];
  const sprint = sprints.find((item) => item.id === issue.sprintId);
  const parent = issues.find((item) => item.id === issue.parentId);
  const subtasks = issues
    .filter((item) => item.parentId === issue.id)
    .sort((a, b) => a.issueNumber - b.issueNumber);
  const isDone = (item: IssueDto) =>
    columns.find((col) => col.id === item.columnId)?.category ===
    BoardColumnCategory.DONE;
  const doneSubtasks = subtasks.filter(isDone);
  const type = options.data?.issueTypes.find((item) => item.id === issue.typeId);
  const priority = options.data?.priorities.find(
    (item) => item.id === issue.priorityId,
  );
  const difficulty = options.data?.difficulties.find(
    (item) => item.id === issue.difficultyId,
  );
  const person = (userId: number) => members.data?.find((item) => item.id === userId);
  const personName = (userId: number) => {
    const member = person(userId);
    return member ? `${member.name} ${member.lastName}` : `Usuario ${userId}`;
  };
  const assignees = issue.assigneeIds
    .map(person)
    .filter((member) => member !== undefined);
  const subtaskType = options.data?.issueTypes.find((item) => item.isSubtask);
  const canAddSubtask =
    canWrite && subtaskType !== undefined && parent === undefined && !type?.isSubtask;

  return shell(
    issue.issueKey,
    <>
      <DialogHeader className="pr-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <IssueTypeIcon type={type} />
            <span className="font-mono text-sm font-medium text-info">
              {issue.issueKey}
            </span>
          </div>
          {canWrite && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!options.data || !members.data}
                onClick={() => setDialog({ issue })}
              >
                <Pencil />
                Editar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsConfirmingDelete(true)}
              >
                <Trash2 />
                Eliminar
              </Button>
            </div>
          )}
        </div>
        <DialogTitle className="text-2xl leading-snug font-bold tracking-tight">
          {issue.title}
        </DialogTitle>
        <DialogDescription className="text-sm">
          {parent ? (
            <span className="inline-flex items-center gap-1.5">
              <CornerDownRight className="size-3.5" aria-hidden="true" />
              Subtarea de{" "}
              <NavLink
                to={`/projects/${projectId}/issues/${parent.id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {parent.issueKey} · {parent.title}
              </NavLink>
            </span>
          ) : (
            <span className="sr-only">
              Detalle del issue en {project.data.projectKey}.
            </span>
          )}
        </DialogDescription>
      </DialogHeader>

      {deleteIssue.isError && (
        <p role="alert" className="text-sm text-destructive">
          {deleteIssue.error.message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex min-w-0 flex-col gap-7">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Descripción</h2>
            {issue.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {issue.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sin descripción.</p>
            )}
          </section>

          {(subtasks.length > 0 || canAddSubtask) && (
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="flex items-baseline gap-2 text-sm font-semibold">
                  Subtareas
                  {subtasks.length > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {doneSubtasks.length} de {subtasks.length} completadas
                    </span>
                  )}
                </h2>
              </div>
              {subtasks.length > 0 && (
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={subtasks.length}
                  aria-valuenow={doneSubtasks.length}
                  aria-label="Subtareas completadas"
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-success transition-[width]"
                    style={{
                      width: `${(doneSubtasks.length / subtasks.length) * 100}%`,
                    }}
                  />
                </div>
              )}
              <ul className="flex flex-col gap-1.5">
                {subtasks.map((subtask) => (
                  <li key={subtask.id}>
                    <NavLink
                      to={`/projects/${projectId}/issues/${subtask.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/60"
                    >
                      {isDone(subtask) ? (
                        <CircleCheck className="size-4 shrink-0 text-success" aria-label="Completada" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" aria-label="Pendiente" />
                      )}
                      <span className="font-mono text-xs text-muted-foreground">
                        {subtask.issueKey}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {subtask.title}
                      </span>
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                        {columns.find((col) => col.id === subtask.columnId)?.name}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
              {canAddSubtask && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  disabled={!options.data || !members.data}
                  onClick={() =>
                    setDialog({
                      defaults: { typeId: subtaskType.id, parentId: issue.id },
                    })
                  }
                >
                  <Plus />
                  Nueva subtarea
                </Button>
              )}
            </section>
          )}

          <IssueComments
            issue={{ id: projectId, issueId }}
            currentUserId={user?.id}
            canWrite={canWrite}
          />
        </div>

        <aside className="h-fit rounded-xl border border-border bg-muted/40 p-4">
          <dl className="flex flex-col gap-4">
            <Detail label="Estado">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-primary"
                style={column?.color ? { backgroundColor: column.color } : undefined}
              />
              {column?.name ?? "—"}
            </Detail>
            <Detail label="Responsables">
              {assignees.length > 0 ? (
                <span className="flex flex-col gap-2">
                  {assignees.map((member) => (
                    <span key={member.id} className="flex items-center gap-2">
                      <AssigneeStack people={[member]} />
                      {member.name} {member.lastName}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">Sin asignar</span>
              )}
            </Detail>
            <Detail label="Prioridad">
              {priority ? (
                <>
                  <PriorityIcon priority={priority} />
                  {priority.name}
                </>
              ) : (
                "—"
              )}
            </Detail>
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Tipo">{type?.name ?? "—"}</Detail>
              <Detail label="Dificultad">
                <span className="font-mono text-[0.8125rem]">
                  {difficulty?.name ?? "—"}
                </span>
              </Detail>
            </div>
            <Detail label="Sprint">{sprint?.name ?? "Backlog"}</Detail>
            <div className="flex flex-col gap-3 border-t border-border pt-4 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Reportado por</span>
                <span className="text-right">{personName(issue.reporterId)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Resuelto</span>
                <span className="text-right">
                  {issue.resolvedAt
                    ? new Date(issue.resolvedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>
          </dl>
        </aside>
      </div>

      <ConfirmDialogComponent
        open={isConfirmingDelete}
        title={`¿Eliminar ${issue.issueKey}?`}
        description={
          subtasks.length > 0
            ? `También se eliminarán sus ${subtasks.length} subtareas. Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."
        }
        confirmLabel="Eliminar issue"
        pendingLabel="Eliminando..."
        isPending={deleteIssue.isPending}
        destructive
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() =>
          deleteIssue.mutate(
            { id: projectId, issueId },
            {
              onSuccess: () => navigate(`/projects/${projectId}`),
              onSettled: () => setIsConfirmingDelete(false),
            },
          )
        }
      />

      {dialog && options.data && members.data && (
        <IssueFormDialog
          project={project.data}
          options={options.data}
          columns={columns}
          issues={issues}
          sprints={sprints.filter(
            (item) => item.status !== SprintStatus.CLOSED,
          )}
          members={members.data}
          issue={dialog.issue}
          defaults={dialog.defaults}
          onClose={() => setDialog(null)}
        />
      )}
    </>,
  );
}
