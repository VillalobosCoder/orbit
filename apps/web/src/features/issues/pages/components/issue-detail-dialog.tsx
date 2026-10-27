import { useState, type ReactNode } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import IssueComments from "@/features/comments/pages/components/issue-comments";
import {
  useGetProject,
  useGetProjectMembers,
} from "@/features/projects/api/queries";
import { BoardColumnCategory, type IssueDto } from "@orbit/shared";
import {
  useDeleteIssue,
  useGetBoard,
  useGetIssueOptions,
} from "../../api/queries";
import IssueFormDialog from "./issue-form-dialog";

type DialogState = {
  issue?: IssueDto;
  defaults?: { typeId?: number; parentId?: number };
} | null;

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
  const deleteIssue = useDeleteIssue();
  const [dialog, setDialog] = useState<DialogState>(null);
  const close = () => navigate(`/projects/${projectId}`);

  const shell = (title: string, content: ReactNode) => (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        {content ?? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
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
      <p role="alert">{(project.error ?? board.error)?.message}</p>,
    );
  }
  if (!project.data || !board.data) return null;

  const { columns, issues } = board.data;
  const issue = issues.find((item) => item.id === issueId);

  if (!issue) {
    return shell(
      "Issue no encontrado",
      <p role="alert">Este issue no existe o fue eliminado.</p>,
    );
  }

  const column = columns.find((item) => item.id === issue.columnId);
  const parent = issues.find((item) => item.id === issue.parentId);
  const subtasks = issues
    .filter((item) => item.parentId === issue.id)
    .sort((a, b) => a.issueNumber - b.issueNumber);
  const doneSubtasks = subtasks.filter(
    (subtask) =>
      columns.find((item) => item.id === subtask.columnId)?.category ===
      BoardColumnCategory.DONE,
  );
  const typeName = (item: IssueDto) =>
    options.data?.issueTypes.find((type) => type.id === item.typeId)?.name;
  const priority = options.data?.priorities.find(
    (item) => item.id === issue.priorityId,
  );
  const difficulty = options.data?.difficulties.find(
    (item) => item.id === issue.difficultyId,
  );
  const memberName = (userId: number) => {
    const member = members.data?.find((item) => item.id === userId);
    return member ? `${member.name} ${member.lastName}` : `Usuario ${userId}`;
  };
  const subtaskType = options.data?.issueTypes.find((type) => type.isSubtask);
  const canAddSubtask =
    canWrite && subtaskType !== undefined && parent === undefined &&
    !options.data?.issueTypes.find((type) => type.id === issue.typeId)
      ?.isSubtask;

  function handleDelete() {
    const message =
      subtasks.length > 0
        ? `¿Seguro que quieres eliminar ${issue!.issueKey} y sus ${subtasks.length} subtareas?`
        : `¿Seguro que quieres eliminar ${issue!.issueKey}?`;

    if (window.confirm(message)) {
      deleteIssue.mutate(
        { id: projectId, issueId },
        { onSuccess: () => navigate(`/projects/${projectId}`) },
      );
    }
  }

  return shell(
    issue.issueKey,
    <>
      <DialogHeader>
        <DialogTitle>
          {issue.issueKey} · {issue.title}
        </DialogTitle>
        <DialogDescription>
          {parent ? (
            <>
              Subtarea de{" "}
              <NavLink to={`/projects/${projectId}/issues/${parent.id}`}>
                {parent.issueKey} · {parent.title}
              </NavLink>
            </>
          ) : (
            `Detalle del issue en ${project.data.projectKey}.`
          )}
        </DialogDescription>
      </DialogHeader>
      {canWrite && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!options.data || !members.data}
            onClick={() => setDialog({ issue })}
          >
            Editar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteIssue.isPending}
            onClick={handleDelete}
          >
            {deleteIssue.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      )}
      {deleteIssue.isError && <p role="alert">{deleteIssue.error.message}</p>}

      <dl>
        <dt>Estado</dt>
        <dd>{column?.name ?? "—"}</dd>
        <dt>Tipo</dt>
        <dd>{typeName(issue) ?? "—"}</dd>
        <dt>Prioridad</dt>
        <dd>{priority?.name ?? "—"}</dd>
        <dt>Dificultad</dt>
        <dd>{difficulty?.name ?? "—"}</dd>
        <dt>Reportado por</dt>
        <dd>{memberName(issue.reporterId)}</dd>
        <dt>Responsables</dt>
        <dd>
          {issue.assigneeIds.length > 0
            ? issue.assigneeIds.map(memberName).join(", ")
            : "Sin asignar"}
        </dd>
        <dt>Resuelto</dt>
        <dd>
          {issue.resolvedAt
            ? new Date(issue.resolvedAt).toLocaleString()
            : "—"}
        </dd>
      </dl>

      <section>
        <h2>Descripción</h2>
        <p className="whitespace-pre-wrap">
          {issue.description ?? "Sin descripción."}
        </p>
      </section>

      {(subtasks.length > 0 || canAddSubtask) && (
        <section>
          <h2>
            Subtareas
            {subtasks.length > 0 &&
              ` (${doneSubtasks.length}/${subtasks.length} completadas)`}
          </h2>
          {canAddSubtask && (
            <Button
              type="button"
              variant="outline"
              disabled={!options.data || !members.data}
              onClick={() =>
                setDialog({
                  defaults: { typeId: subtaskType.id, parentId: issue.id },
                })
              }
            >
              Nueva subtarea
            </Button>
          )}
          <ul>
            {subtasks.map((subtask) => (
              <li key={subtask.id}>
                <NavLink to={`/projects/${projectId}/issues/${subtask.id}`}>
                  {subtask.issueKey} · {subtask.title}
                </NavLink>{" "}
                —{" "}
                {columns.find((item) => item.id === subtask.columnId)?.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <IssueComments
        issue={{ id: projectId, issueId }}
        currentUserId={user?.id}
        canWrite={canWrite}
      />

      {dialog && options.data && members.data && (
        <IssueFormDialog
          project={project.data}
          options={options.data}
          columns={columns}
          issues={issues}
          members={members.data}
          issue={dialog.issue}
          defaults={dialog.defaults}
          onClose={() => setDialog(null)}
        />
      )}
    </>,
  );
}
