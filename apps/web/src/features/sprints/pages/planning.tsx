import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/auth/use-permission";
import { useGetIssueOptions } from "@/features/issues/api/queries";
import IssueFormDialog from "@/features/issues/pages/components/issue-form-dialog";
import {
  useGetProject,
  useGetProjectMembers,
} from "@/features/projects/api/queries";
import {
  BoardColumnCategory,
  SprintStatus,
  type IssueDto,
  type SprintDto,
} from "@orbit/shared";
import {
  useAssignIssueSprint,
  useCloseSprint,
  useDeleteSprint,
  useGetPlanning,
  useStartSprint,
} from "../api/queries";
import SprintFormDialog from "./components/sprint-form-dialog";

/** `sprint` edita ese sprint; sin él, crea uno nuevo. */
type SprintDialogState = { sprint?: SprintDto } | null;

const STATUS_LABELS: Record<SprintStatus, string> = {
  [SprintStatus.PLANNED]: "Planeado",
  [SprintStatus.ACTIVE]: "Activo",
  [SprintStatus.CLOSED]: "Cerrado",
};

export default function PlanningPage() {
  const params = useParams();
  const projectId = Number(params.id);
  const { canWrite } = usePermission("projects");
  const project = useGetProject(projectId);
  const planning = useGetPlanning(projectId);
  const options = useGetIssueOptions(projectId);
  const members = useGetProjectMembers(projectId);
  const startSprint = useStartSprint();
  const closeSprint = useCloseSprint();
  const deleteSprint = useDeleteSprint();
  const assignSprint = useAssignIssueSprint();
  const [sprintDialog, setSprintDialog] = useState<SprintDialogState>(null);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);

  if (project.isLoading || planning.isLoading) {
    return <p>Cargando planificación...</p>;
  }
  if (project.isError) return <p role="alert">{project.error.message}</p>;
  if (planning.isError) return <p role="alert">{planning.error.message}</p>;
  if (!project.data || !planning.data) return null;

  const { sprints, columns, issues } = planning.data;
  // Las subtareas siguen a su padre: solo se planifican los issues raíz.
  const rootIssues = issues.filter((issue) => issue.parentId === null);
  const openSprints = sprints.filter(
    (sprint) => sprint.status !== SprintStatus.CLOSED,
  );
  const closedSprints = sprints.filter(
    (sprint) => sprint.status === SprintStatus.CLOSED,
  );
  const issuesIn = (sprintId: number | null) =>
    rootIssues
      .filter((issue) => issue.sprintId === sprintId)
      .sort((a, b) => a.issueNumber - b.issueNumber);
  const subtaskCount = (issue: IssueDto) =>
    issues.filter((item) => item.parentId === issue.id).length;
  const columnName = (issue: IssueDto) =>
    columns.find((column) => column.id === issue.columnId)?.name ?? "—";
  const doneCount = (sprintId: number) =>
    issuesIn(sprintId).filter(
      (issue) =>
        columns.find((column) => column.id === issue.columnId)?.category ===
        BoardColumnCategory.DONE,
    ).length;

  function handleClose(sprint: SprintDto) {
    const pending = issuesIn(sprint.id).length - doneCount(sprint.id);
    const message =
      pending > 0
        ? `¿Completar ${sprint.name}? ${pending} issue(s) sin terminar volverán al backlog.`
        : `¿Completar ${sprint.name}?`;

    if (window.confirm(message)) {
      closeSprint.mutate({ id: projectId, sprintId: sprint.id });
    }
  }

  function handleDelete(sprint: SprintDto) {
    if (
      window.confirm(
        `¿Eliminar ${sprint.name}? Sus issues volverán al backlog.`,
      )
    ) {
      deleteSprint.mutate({ id: projectId, sprintId: sprint.id });
    }
  }

  const renderIssues = (list: IssueDto[]) =>
    list.length === 0 ? (
      <p>Sin issues.</p>
    ) : (
      <ul className="space-y-1">
        {list.map((issue) => (
          <li key={issue.id} className="flex items-center gap-2 text-sm">
            <NavLink to={`/projects/${projectId}/issues/${issue.id}`}>
              {issue.issueKey} · {issue.title}
            </NavLink>
            <span className="text-muted-foreground">
              {columnName(issue)}
              {subtaskCount(issue) > 0 && ` · ${subtaskCount(issue)} subtareas`}
            </span>
            {canWrite && (
              <select
                aria-label={`Mover ${issue.issueKey} a`}
                value={issue.sprintId ?? ""}
                disabled={assignSprint.isPending}
                onChange={(event) =>
                  assignSprint.mutate({
                    id: projectId,
                    issueId: issue.id,
                    sprintId: event.currentTarget.value
                      ? Number(event.currentTarget.value)
                      : null,
                  })
                }
              >
                <option value="">Backlog</option>
                {openSprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            )}
          </li>
        ))}
      </ul>
    );

  return (
    <div>
      <NavLink to={`/projects/${projectId}`}>
        ← {project.data.projectKey} · {project.data.name}
      </NavLink>
      <h1>Planificación</h1>
      {canWrite && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSprintDialog({})}
          >
            Nuevo sprint
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!options.data || !members.data}
            onClick={() => setIsCreatingIssue(true)}
          >
            Nuevo issue
          </Button>
        </div>
      )}
      {[startSprint, closeSprint, deleteSprint, assignSprint].map(
        (mutation, index) =>
          mutation.isError && (
            <p key={index} role="alert">
              {mutation.error.message}
            </p>
          ),
      )}

      {openSprints.map((sprint) => (
        <section key={sprint.id} className="my-4 rounded-md border border-border p-3">
          <h2>
            {sprint.name} · {STATUS_LABELS[sprint.status]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {sprint.startDate ?? "sin inicio"} → {sprint.endDate ?? "sin fin"}
            {sprint.goal && ` · ${sprint.goal}`}
          </p>
          {canWrite && (
            <div className="flex gap-2">
              {sprint.status === SprintStatus.PLANNED && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={startSprint.isPending}
                    onClick={() =>
                      startSprint.mutate({ id: projectId, sprintId: sprint.id })
                    }
                  >
                    Iniciar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deleteSprint.isPending}
                    onClick={() => handleDelete(sprint)}
                  >
                    Eliminar
                  </Button>
                </>
              )}
              {sprint.status === SprintStatus.ACTIVE && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={closeSprint.isPending}
                  onClick={() => handleClose(sprint)}
                >
                  Completar
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setSprintDialog({ sprint })}
              >
                Editar
              </Button>
            </div>
          )}
          {renderIssues(issuesIn(sprint.id))}
        </section>
      ))}

      <section className="my-4 rounded-md border border-border p-3">
        <h2>Backlog</h2>
        {renderIssues(issuesIn(null))}
      </section>

      {closedSprints.length > 0 && (
        <section>
          <h2>Sprints cerrados</h2>
          <ul>
            {closedSprints.map((sprint) => (
              <li key={sprint.id}>
                {sprint.name} · {sprint.startDate ?? "?"} →{" "}
                {sprint.endDate ?? "?"} · {doneCount(sprint.id)}/
                {issuesIn(sprint.id).length} issues terminados
              </li>
            ))}
          </ul>
        </section>
      )}

      {sprintDialog && (
        <SprintFormDialog
          project={project.data}
          sprint={sprintDialog.sprint}
          onClose={() => setSprintDialog(null)}
        />
      )}
      {isCreatingIssue && options.data && members.data && (
        <IssueFormDialog
          project={project.data}
          options={options.data}
          columns={columns}
          issues={issues}
          sprints={openSprints}
          members={members.data}
          onClose={() => setIsCreatingIssue(false)}
        />
      )}
    </div>
  );
}
