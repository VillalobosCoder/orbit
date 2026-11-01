import { NavLink } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { BoardColumnCategory, HOME_ASSIGNED_ISSUES_LIMIT } from "@orbit/shared";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import { useGetHomeSummary } from "@/features/home/api/queries";
import { daysUntil } from "@/features/sprints/pages/utils/format-date";

const ROW_HEIGHT_REM = 3.5;

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
  isLoading,
}: {
  label: string;
  value: number | string;
  caption: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 flex h-9 items-center text-3xl font-bold tracking-tight">
        {isLoading ? (
          <Spinner aria-label="Cargando" className="size-5 text-muted-foreground" />
        ) : (
          value
        )}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { hasAccess } = usePermission("projects");
  const summary = useGetHomeSummary({ enabled: hasAccess });
  const isLoading = summary.isLoading;
  const loadError = summary.error;
  const projects = summary.data?.projects ?? [];
  const assigned = summary.data?.assigned ?? {
    total: 0,
    inProgress: 0,
    items: [],
  };
  const activeSprints = projects.filter((project) => project.activeSprint);
  const closingThisWeek = activeSprints.filter((project) => {
    const endDate = project.activeSprint?.endDate;
    if (!endDate) return false;
    const days = daysUntil(endDate);
    return days >= 0 && days <= 7;
  }).length;
  const fillerCount = HOME_ASSIGNED_ISSUES_LIMIT - assigned.items.length;

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
      ) : (
        <>
          {loadError && (
            <p
              role="alert"
              className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              {loadError.message}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Proyectos"
              value={projects.length}
              caption={`${activeSprints.length} con sprint activo`}
              isLoading={isLoading}
            />
            <SummaryCard
              label="Asignados a ti"
              value={assigned.total}
              caption={`${assigned.inProgress} en curso`}
              isLoading={isLoading}
            />
            <SummaryCard
              label="Cierran esta semana"
              value={closingThisWeek}
              caption={closingThisWeek === 1 ? "sprint por cerrar" : "sprints por cerrar"}
              isLoading={isLoading}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <section
              aria-label="Asignados a ti"
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <h2 className="flex h-13 items-center px-5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                Asignados a ti
              </h2>
              {isLoading || assigned.items.length === 0 ? (
                <div
                  className="flex items-center justify-center border-t border-border text-sm text-muted-foreground"
                  style={{ height: `${HOME_ASSIGNED_ISSUES_LIMIT * ROW_HEIGHT_REM}rem` }}
                >
                  {isLoading ? (
                    <Spinner aria-label="Cargando" className="size-6" />
                  ) : (
                    "Sin registros"
                  )}
                </div>
              ) : (
                <ul>
                  {assigned.items.map(
                    ({ id, projectId, issueKey, title, columnName, category }) => (
                      <li
                        key={id}
                        className="h-14 border-t border-border"
                      >
                        <NavLink
                          to={`/projects/${projectId}/issues/${id}`}
                          className="flex h-full items-center gap-3 px-5 text-sm transition-colors hover:bg-accent/50"
                        >
                          <span className="w-20 shrink-0 font-mono text-xs text-info">
                            {issueKey}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {title}
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
                  {Array.from({ length: fillerCount }, (_, index) => (
                    <li
                      key={`filler-${index}`}
                      aria-hidden="true"
                      className="h-14 border-t border-border"
                    />
                  ))}
                </ul>
              )}
              <p className="flex h-11 items-center border-t border-border px-5 text-xs text-muted-foreground">
                {!isLoading && assigned.total > 0 &&
                  (assigned.total > assigned.items.length
                    ? `Mostrando ${assigned.items.length} de ${assigned.total} issues asignados`
                    : `${assigned.total} ${assigned.total === 1 ? "issue asignado" : "issues asignados"}`)}
              </p>
            </section>

            <section
              aria-label="Sprints activos"
              className="flex flex-col gap-3 lg:h-[34rem]"
            >
              <h2 className="px-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                Sprints activos
              </h2>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-6">
                    <Spinner
                      aria-label="Cargando"
                      className="size-6 text-muted-foreground"
                    />
                  </div>
                ) : projects.length === 0 ? (
                  <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Sin registros
                  </p>
                ) : (
                  projects.map((project) => {
                    const sprint = project.activeSprint;

                    if (!sprint) {
                      return (
                        <NavLink
                          key={project.id}
                          to={`/projects/${project.id}`}
                          className="shrink-0 rounded-xl border border-dashed border-border p-4 text-sm transition-colors hover:border-primary/60"
                        >
                          <span className="font-mono text-xs text-muted-foreground">
                            {project.projectKey}
                          </span>{" "}
                          <strong className="font-semibold">{project.name}</strong>
                          <p className="mt-1 text-muted-foreground">
                            Sin sprint activo · {project.backlogIssues} issues en
                            el backlog
                          </p>
                        </NavLink>
                      );
                    }

                    const { totalIssues, doneIssues } = sprint;

                    return (
                      <NavLink
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="shrink-0 rounded-xl border border-info/40 bg-linear-to-r from-info/10 to-card p-4 text-sm transition-colors hover:border-info"
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
                          aria-valuemax={totalIssues}
                          aria-valuenow={doneIssues}
                          aria-label={`Progreso de ${sprint.name}`}
                          className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className="h-full rounded-full bg-info"
                            style={{
                              width: `${totalIssues ? (doneIssues / totalIssues) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {doneIssues} de {totalIssues} terminados
                        </p>
                      </NavLink>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
