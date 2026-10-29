import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, ListTree, Plus } from "lucide-react";
import {
  BoardColumnCategory,
  SprintStatus,
  type IssueDto,
  type IssueOptionsDto,
  type ProjectMemberDto,
  type SprintDto,
} from "@orbit/shared";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/context/auth/use-permission";
import { useGetIssueOptions } from "@/features/issues/api/queries";
import IssueFormDialog from "@/features/issues/pages/components/issue-form-dialog";
import {
  AssigneeStack,
  IssueTypeIcon,
  PriorityIcon,
} from "@/features/issues/pages/components/issue-visuals";
import {
  useGetProject,
  useGetProjectMembers,
} from "@/features/projects/api/queries";
import { ConfirmDialogComponent } from "@/shared/ui/custom-components/confirm-dialog-component";
import { PageHeaderComponent } from "@/shared/ui/custom-components/page-header-component";
import {
  useAssignIssueSprint,
  useCloseSprint,
  useDeleteSprint,
  useGetPlanning,
  useStartSprint,
} from "../api/queries";
import SprintFormDialog from "./components/sprint-form-dialog";
import { formatDateRange } from "./utils/format-date";

type SprintDialogState = { sprint?: SprintDto } | null;
type ConfirmState = { kind: "close" | "delete"; sprint: SprintDto } | null;

const STATUS_LABELS: Record<SprintStatus, string> = {
  [SprintStatus.PLANNED]: "Planeado",
  [SprintStatus.ACTIVE]: "Activo",
  [SprintStatus.CLOSED]: "Cerrado",
};

function ErrorAlert({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

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
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  if (project.isLoading || planning.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }
  if (project.isError) {
    return (
      <div className="p-6">
        <ErrorAlert>{project.error.message}</ErrorAlert>
      </div>
    );
  }
  if (planning.isError) {
    return (
      <div className="p-6">
        <ErrorAlert>{planning.error.message}</ErrorAlert>
      </div>
    );
  }
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
  const isDone = (issue: IssueDto) =>
    columns.find((column) => column.id === issue.columnId)?.category ===
    BoardColumnCategory.DONE;
  const doneCount = (sprintId: number) =>
    issuesIn(sprintId).filter(isDone).length;
  const mutations = [startSprint, closeSprint, deleteSprint, assignSprint];

  function renderIssueRow(issue: IssueDto) {
    const subtasks = issues.filter((item) => item.parentId === issue.id).length;
    const column = columns.find((item) => item.id === issue.columnId);
    const optionData: IssueOptionsDto | undefined = options.data;
    const assignees: ProjectMemberDto[] = issue.assigneeIds
      .map((userId) => members.data?.find((member) => member.id === userId))
      .filter((member) => member !== undefined);

    return (
      <li
        key={issue.id}
        className="flex items-center gap-3 border-t border-border px-4 py-2.5 text-sm first:border-t-0"
      >
        <IssueTypeIcon
          type={optionData?.issueTypes.find((type) => type.id === issue.typeId)}
        />
        <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
          {issue.issueKey}
        </span>
        <NavLink
          to={`/projects/${projectId}/issues/${issue.id}`}
          className="min-w-0 flex-1 truncate font-medium hover:underline"
        >
          {issue.title}
        </NavLink>
        {subtasks > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ListTree className="size-3.5" aria-hidden="true" />
            {subtasks}
          </span>
        )}
        <Badge variant={isDone(issue) ? "success" : "default"}>
          {column?.name ?? "—"}
        </Badge>
        <PriorityIcon
          priority={optionData?.priorities.find(
            (priority) => priority.id === issue.priorityId,
          )}
        />
        <AssigneeStack people={assignees} />
        {canWrite && (
          <NativeSelect
            aria-label={`Mover ${issue.issueKey} a`}
            className="h-8 w-40 text-[0.8125rem]"
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
          </NativeSelect>
        )}
      </li>
    );
  }

  function renderIssueList(list: IssueDto[]) {
    return list.length === 0 ? (
      <p className="m-3 rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
        Sin issues.
      </p>
    ) : (
      <ul>{list.map(renderIssueRow)}</ul>
    );
  }

  const confirmSprint = confirm?.sprint;
  const pendingInSprint = confirmSprint
    ? issuesIn(confirmSprint.id).length - doneCount(confirmSprint.id)
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3">
        <NavLink
          to={`/projects/${projectId}`}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span className="font-mono text-xs">{project.data.projectKey}</span>
          {project.data.name}
        </NavLink>
        <PageHeaderComponent
          title="Planificación"
          description="Organiza los issues en sprints y mantén el backlog al día."
        >
          {canWrite && (
            <>
              <Button type="button" variant="outline" onClick={() => setSprintDialog({})}>
                <Plus />
                Nuevo sprint
              </Button>
              <Button
                type="button"
                disabled={!options.data || !members.data}
                onClick={() => setIsCreatingIssue(true)}
              >
                <Plus />
                Nuevo issue
              </Button>
            </>
          )}
        </PageHeaderComponent>
      </div>

      {mutations.map(
        (mutation, index) =>
          mutation.isError && (
            <ErrorAlert key={index}>{mutation.error.message}</ErrorAlert>
          ),
      )}

      {openSprints.map((sprint) => {
        const total = issuesIn(sprint.id).length;
        const done = doneCount(sprint.id);
        const isActive = sprint.status === SprintStatus.ACTIVE;

        return (
          <section
            key={sprint.id}
            aria-label={sprint.name}
            className={cn(
              "overflow-hidden rounded-xl border bg-card",
              isActive ? "border-info/40" : "border-border",
            )}
          >
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3",
                isActive
                  ? "border-info/30 bg-linear-to-r from-info/10 to-transparent"
                  : "border-border",
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-semibold">{sprint.name}</h2>
                  <Badge variant={isActive ? "info" : "muted"}>
                    {isActive && (
                      <span
                        className="size-1.5 rounded-full bg-info shadow-[0_0_8px_var(--info)]"
                        aria-hidden="true"
                      />
                    )}
                    {STATUS_LABELS[sprint.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateRange(sprint.startDate, sprint.endDate)}
                  {sprint.goal && ` · ${sprint.goal}`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {isActive && total > 0 && (
                  <div className="w-36">
                    <p className="mb-1 text-xs text-muted-foreground">
                      {done} / {total} terminados
                    </p>
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={total}
                      aria-valuenow={done}
                      aria-label="Issues terminados"
                      className="h-1 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-info"
                        style={{ width: `${(done / total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {canWrite && (
                  <div className="flex flex-wrap gap-2">
                    {sprint.status === SprintStatus.PLANNED && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={deleteSprint.isPending}
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setConfirm({ kind: "delete", sprint })}
                      >
                        Eliminar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSprintDialog({ sprint })}
                    >
                      Editar
                    </Button>
                    {sprint.status === SprintStatus.PLANNED && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={startSprint.isPending}
                        onClick={() =>
                          startSprint.mutate({
                            id: projectId,
                            sprintId: sprint.id,
                          })
                        }
                      >
                        Iniciar
                      </Button>
                    )}
                    {isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={closeSprint.isPending}
                        onClick={() => setConfirm({ kind: "close", sprint })}
                      >
                        Completar sprint
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {renderIssueList(issuesIn(sprint.id))}
          </section>
        );
      })}

      <section
        aria-label="Backlog"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">Backlog</h2>
          <span className="text-sm text-muted-foreground">
            {issuesIn(null).length} issues
          </span>
        </div>
        {renderIssueList(issuesIn(null))}
      </section>

      {closedSprints.length > 0 && (
        <section
          aria-label="Historial de sprints"
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <h2 className="border-b border-border px-4 py-3 text-base font-semibold">
            Historial de sprints
          </h2>
          <ul>
            {closedSprints.map((sprint) => (
              <li
                key={sprint.id}
                className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3 text-sm first:border-t-0"
              >
                <strong className="flex-1 font-semibold">{sprint.name}</strong>
                <span className="text-muted-foreground">
                  {formatDateRange(sprint.startDate, sprint.endDate)}
                </span>
                <Badge variant="muted">Cerrado</Badge>
                <span className="w-36 text-right text-muted-foreground">
                  {doneCount(sprint.id)} / {issuesIn(sprint.id).length}{" "}
                  terminados
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialogComponent
        open={confirm !== null}
        title={
          confirm?.kind === "close"
            ? `¿Completar ${confirmSprint?.name}?`
            : `¿Eliminar ${confirmSprint?.name}?`
        }
        description={
          confirm?.kind === "close"
            ? pendingInSprint > 0
              ? `${pendingInSprint} issue(s) sin terminar volverán al backlog.`
              : "Todos sus issues están terminados. El sprint pasará al historial."
            : "Sus issues volverán al backlog."
        }
        confirmLabel={
          confirm?.kind === "close" ? "Completar sprint" : "Eliminar sprint"
        }
        pendingLabel="Procesando..."
        isPending={closeSprint.isPending || deleteSprint.isPending}
        destructive={confirm?.kind === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          const request = { id: projectId, sprintId: confirm.sprint.id };
          const callbacks = { onSettled: () => setConfirm(null) };

          if (confirm.kind === "close") closeSprint.mutate(request, callbacks);
          else deleteSprint.mutate(request, callbacks);
        }}
      />

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
