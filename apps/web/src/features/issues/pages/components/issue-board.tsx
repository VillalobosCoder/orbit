import { useState, type DragEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/context/auth/use-permission";
import { useGetProjectMembers } from "@/features/projects/api/queries";
import type { IssueDto, ProjectDto } from "@orbit/shared";
import {
  useGetBoard,
  useGetIssueOptions,
  useMoveIssue,
} from "../../api/queries";
import BoardColumnsDialog from "./board-columns-dialog";
import IssueFormDialog from "./issue-form-dialog";

type DropTarget = { columnId: number; beforeIssueId: number | null };

export default function IssueBoard({ project }: { project: ProjectDto }) {
  const { canWrite } = usePermission("projects");
  const board = useGetBoard(project.id);
  const options = useGetIssueOptions(project.id);
  const members = useGetProjectMembers(project.id);
  const moveIssue = useMoveIssue();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingColumns, setIsEditingColumns] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  if (board.isLoading) return <p>Cargando tablero...</p>;
  if (board.isError) return <p role="alert">{board.error.message}</p>;
  if (!board.data) return null;

  const { columns, issues, activeSprint } = board.data;
  const issuesIn = (columnId: number, withoutDragged = false) =>
    issues
      .filter(
        (issue) =>
          issue.columnId === columnId &&
          !(withoutDragged && issue.id === draggingId),
      )
      .sort((a, b) => a.boardPosition - b.boardPosition || a.id - b.id);
  const typeName = (issue: IssueDto) =>
    options.data?.issueTypes.find((type) => type.id === issue.typeId)?.name;
  const priorityName = (issue: IssueDto) =>
    options.data?.priorities.find((priority) => priority.id === issue.priorityId)
      ?.name;
  const parentKey = (issue: IssueDto) =>
    issues.find((candidate) => candidate.id === issue.parentId)?.issueKey;
  const difficultyName = (issue: IssueDto) =>
    options.data?.difficulties.find(
      (difficulty) => difficulty.id === issue.difficultyId,
    )?.name;
  const assigneeNames = (issue: IssueDto) =>
    issue.assigneeIds
      .map((userId) => members.data?.find((member) => member.id === userId))
      .filter((member) => member !== undefined)
      .map((member) => `${member.name} ${member.lastName}`)
      .join(", ");

  function resetDrag() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function handleCardDragOver(
    event: DragEvent<HTMLElement>,
    issue: IssueDto,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (issue.id === draggingId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const isLowerHalf = event.clientY >= rect.top + rect.height / 2;
    const column = issuesIn(issue.columnId, true);
    const following = column[column.findIndex((item) => item.id === issue.id) + 1];

    setDropTarget({
      columnId: issue.columnId,
      beforeIssueId: isLowerHalf ? (following?.id ?? null) : issue.id,
    });
  }

  function handleDrop(columnId: number) {
    if (draggingId === null || !canWrite) return resetDrag();

    const column = issuesIn(columnId, true);
    const beforeIndex = column.findIndex(
      (issue) => issue.id === dropTarget?.beforeIssueId,
    );
    const index = beforeIndex === -1 ? column.length : beforeIndex;

    moveIssue.mutate({
      id: project.id,
      issueId: draggingId,
      columnId,
      previousIssueId: column[index - 1]?.id ?? null,
      nextIssueId: column[index]?.id ?? null,
    });
    resetDrag();
  }

  return (
    <section>
      <h2>Tablero</h2>
      <p className="text-sm text-muted-foreground">
        {activeSprint
          ? `Sprint activo: ${activeSprint.name}${activeSprint.endDate ? ` · hasta ${activeSprint.endDate}` : ""}`
          : "Sin sprint activo: se muestran los issues del backlog."}{" "}
        <NavLink to={`/projects/${project.id}/planning`}>Planificación</NavLink>
      </p>
      {canWrite && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditingColumns(true)}
        >
          Columnas
        </Button>
      )}
      {canWrite && (
        <Button
          type="button"
          variant="outline"
          disabled={!options.data || !members.data}
          onClick={() => setIsCreating(true)}
        >
          Nuevo issue
        </Button>
      )}
      {moveIssue.isError && <p role="alert">{moveIssue.error.message}</p>}
      <div className="flex gap-4 overflow-x-auto py-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`min-h-40 w-72 shrink-0 rounded-md border p-2 ${
              dropTarget?.columnId === column.id ? "border-primary" : "border-border"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDropTarget({ columnId: column.id, beforeIssueId: null });
            }}
            onDrop={() => handleDrop(column.id)}
          >
            <h3 className="mb-2 text-sm font-semibold">{column.name}</h3>
            <ul className="space-y-2">
              {issuesIn(column.id).map((issue) => (
                <li
                  key={issue.id}
                  draggable={canWrite}
                  className="cursor-pointer rounded-md border border-border bg-card p-2 text-sm"
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(issue.id));
                    setDraggingId(issue.id);
                  }}
                  onDragEnd={resetDrag}
                  onDragOver={(event) => handleCardDragOver(event, issue)}
                  onClick={() =>
                    navigate(`/projects/${project.id}/issues/${issue.id}`)
                  }
                >
                  <div className="text-xs text-muted-foreground">
                    {issue.issueKey}
                    {typeName(issue) && ` · ${typeName(issue)}`}
                    {priorityName(issue) && ` · ${priorityName(issue)}`}
                    {difficultyName(issue) && ` · ${difficultyName(issue)}`}
                  </div>
                  <div>{issue.title}</div>
                  {parentKey(issue) && (
                    <div className="text-xs text-muted-foreground">
                      Subtarea de {parentKey(issue)}
                    </div>
                  )}
                  {issue.assigneeIds.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {assigneeNames(issue)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {isCreating && options.data && members.data && (
        <IssueFormDialog
          project={project}
          options={options.data}
          columns={columns}
          issues={issues}
          sprints={activeSprint ? [activeSprint] : []}
          defaultSprintId={activeSprint?.id ?? null}
          members={members.data}
          onClose={() => setIsCreating(false)}
        />
      )}
      {isEditingColumns && (
        <BoardColumnsDialog
          project={project}
          columns={columns}
          onClose={() => setIsEditingColumns(false)}
        />
      )}
    </section>
  );
}
