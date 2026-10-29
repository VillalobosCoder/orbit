import { NavLink } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import {
  BoardColumnCategory,
  type BoardDto,
  type IssueDto,
  type ProjectDto,
} from "@orbit/shared";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { useGetBoards } from "@/features/issues/api/queries";
import { useGetProjects } from "@/features/projects/api/queries";
import { daysUntil } from "@/features/sprints/pages/utils/format-date";

const MAX_ASSIGNED = 8;

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function getToday() {
  const text = new Date().toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function describeDays(days: number) {
  if (days < 0) return "vencido";
  if (days === 0) return "termina hoy";
  return days === 1 ? "1 día" : `${days} días`;
}

function SummaryCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: number | string;
  caption: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

type ProjectBoard = { project: ProjectDto; board: BoardDto };
type AssignedIssue = {
  project: ProjectDto;
  issue: IssueDto;
  columnName: string;
  category: BoardColumnCategory;
};

export default function HomePage() {
  const { user } = useAuth();
  const { hasAccess, canWrite } = usePermission("projects");
  const projects = useGetProjects({ enabled: hasAccess });
  const projectList = projects.data ?? [];
  const boards = useGetBoards(projectList.map((project) => project.id));
  const isLoading = projects.isLoading || boards.some((board) => board.isLoading);

  const projectBoards: ProjectBoard[] = projectList.flatMap((project, index) => {
    const board = boards[index]?.data;
    return board ? [{ project, board }] : [];
  });

  const assigned: AssignedIssue[] = projectBoards
    .flatMap(({ project, board }) =>
      board.issues
        .filter((issue) => user && issue.assigneeIds.includes(user.id))
        .map((issue) => {
          const column = board.columns.find((item) => item.id === issue.columnId);

          return {
            project,
            issue,
            columnName: column?.name ?? "—",
            category: column?.category ?? BoardColumnCategory.TODO,
          };
        }),
    )
    .filter((item) => item.category !== BoardColumnCategory.DONE)
    .sort(
      (a, b) =>
        Number(b.category === BoardColumnCategory.IN_PROGRESS) -
          Number(a.category === BoardColumnCategory.IN_PROGRESS) ||
        a.project.projectKey.localeCompare(b.project.projectKey) ||
        a.issue.issueNumber - b.issue.issueNumber,
    );
  const inProgress = assigned.filter(
    (item) => item.category === BoardColumnCategory.IN_PROGRESS,
  ).length;
  const activeSprints = projectBoards.filter(({ board }) => board.activeSprint);
  const closingThisWeek = activeSprints.filter(({ board }) => {
    const endDate = board.activeSprint?.endDate;
    if (!endDate) return false;
    const days = daysUntil(endDate);
    return days >= 0 && days <= 7;
  }).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">{getToday()}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {getGreeting()}
          {user ? `, ${user.name}` : ""}
        </h1>
      </header>

      {!hasAccess ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aquí aparecerá el resumen de tus proyectos cuando tengas acceso a ellos.
        </p>
      ) : projects.isError ? (
        <p
          role="alert"
          className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {projects.error.message}
        </p>
      ) : isLoading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Proyectos"
              value={projectList.length}
              caption={`${activeSprints.length} con sprint activo`}
            />
            <SummaryCard
              label="Asignados a ti"
              value={assigned.length}
              caption={`${inProgress} en curso`}
            />
            <SummaryCard
              label="Cierran esta semana"
              value={closingThisWeek}
              caption={closingThisWeek === 1 ? "sprint por cerrar" : "sprints por cerrar"}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <section
              aria-label="Asignados a ti"
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <h2 className="px-5 py-4 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                Asignados a ti
              </h2>
              {assigned.length === 0 ? (
                <p className="border-t border-border px-5 py-10 text-center text-sm text-muted-foreground">
                  No tienes issues pendientes en este momento.
                </p>
              ) : (
                <ul>
                  {assigned.slice(0, MAX_ASSIGNED).map(
                    ({ project, issue, columnName, category }) => (
                      <li
                        key={`${project.id}-${issue.id}`}
                        className="border-t border-border"
                      >
                        <NavLink
                          to={`/projects/${project.id}/issues/${issue.id}`}
                          className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-accent/50"
                        >
                          <span className="w-20 shrink-0 font-mono text-xs text-info">
                            {issue.issueKey}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {issue.title}
                          </span>
                          <Badge
                            variant={
                              category === BoardColumnCategory.IN_PROGRESS
                                ? "primary"
                                : "default"
                            }
                          >
                            {columnName}
                          </Badge>
                        </NavLink>
                      </li>
                    ),
                  )}
                </ul>
              )}
              {assigned.length > MAX_ASSIGNED && (
                <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  y {assigned.length - MAX_ASSIGNED} más en tus proyectos
                </p>
              )}
            </section>

            <section aria-label="Sprints activos" className="flex flex-col gap-3">
              <h2 className="px-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                Sprints activos
              </h2>
              {projectBoards.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Aún no tienes proyectos.
                  {canWrite && " Crea el primero con el botón + del menú lateral."}
                </p>
              )}
              {projectBoards.map(({ project, board }) => {
                const sprint = board.activeSprint;

                if (!sprint) {
                  return (
                    <NavLink
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="rounded-xl border border-dashed border-border p-4 text-sm transition-colors hover:border-primary/60"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {project.projectKey}
                      </span>{" "}
                      <strong className="font-semibold">{project.name}</strong>
                      <p className="mt-1 text-muted-foreground">
                        Sin sprint activo · {board.issues.length} issues en el
                        backlog
                      </p>
                    </NavLink>
                  );
                }

                const roots = board.issues.filter(
                  (issue) => issue.parentId === null,
                );
                const done = roots.filter(
                  (issue) =>
                    board.columns.find((column) => column.id === issue.columnId)
                      ?.category === BoardColumnCategory.DONE,
                ).length;

                return (
                  <NavLink
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="rounded-xl border border-info/40 bg-linear-to-r from-info/10 to-card p-4 text-sm transition-colors hover:border-info"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span>
                        <span className="font-mono text-xs text-info">
                          {project.projectKey}
                        </span>{" "}
                        <strong className="font-semibold">{sprint.name}</strong>
                      </span>
                      {sprint.endDate && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {describeDays(daysUntil(sprint.endDate))}
                        </span>
                      )}
                    </div>
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={roots.length}
                      aria-valuenow={done}
                      aria-label={`Progreso de ${sprint.name}`}
                      className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full rounded-full bg-info"
                        style={{
                          width: `${roots.length ? (done / roots.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {done} de {roots.length} terminados
                    </p>
                  </NavLink>
                );
              })}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
