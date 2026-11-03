import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  Circle,
  CircleCheck,
  CornerDownRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { ConfirmDialogComponent } from "@/components/ui/confirm-dialog-component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { UserMultiSelectComponent } from "@/components/ui/user-multi-select-component";
import { useAuth } from "@/context/auth/use-auth";
import { usePermission } from "@/context/auth/use-permission";
import IssueAttachments from "./issue-attachments";
import IssueComments from "@/features/comments/pages/components/issue-comments";
import {
  useCreateIssue,
  useDeleteIssue,
  useUpdateIssue,
} from "@/features/issues/api/queries";
import {
  BoardColumnCategory,
  ISSUE_DESCRIPTION_MAX_LENGTH,
  ISSUE_ESTIMATE_MAX_MINUTES,
  ISSUE_STORY_POINTS_MAX,
  ModuleKey,
  ISSUE_TITLE_MAX_LENGTH,
  SprintStatus,
  type BoardColumnDto,
  type IssueDto,
  type IssueOptionsDto,
  type ProjectDto,
  type ProjectMemberDto,
  type SaveIssueRequestDto,
  type SprintDto,
} from "@orbit/shared";
import { AssigneeStack, IssueTypeIcon, PriorityIcon } from "./issue-visuals";
import { formatDate, formatEstimate, getDueState } from "../../utils/due-date";
import { columnLabel, issueTypeLabel, priorityLabel } from "@/i18n/catalog";
import { useI18n } from "@/i18n/use-i18n";

interface IssueDialogProps {
  project: ProjectDto;
  options: IssueOptionsDto;
  columns: BoardColumnDto[];
  issues: IssueDto[];
  sprints: SprintDto[];
  members: ProjectMemberDto[];
  issue?: IssueDto;
  defaults?: { typeId?: number; parentId?: number };
  defaultSprintId?: number | null;
  onClose: () => void;
}

type Draft = {
  title: string;
  description: string;
  typeId: number;
  parentId: number | null;
  columnId: number;
  priorityId: number | null;
  difficultyId: number | null;
  sprintId: number | null;
  assigneeIds: number[];
  startDate: string;
  dueDate: string;
  estimateHours: string;
  storyPoints: string;
};

function toNumberOrNull(value: string) {
  return value ? Number(value) : null;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 text-sm">{children}</dd>
    </div>
  );
}

export default function IssueDialog({
  project,
  options,
  columns,
  issues,
  sprints,
  members,
  issue,
  defaults,
  defaultSprintId = null,
  onClose,
}: IssueDialogProps) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { canWrite } = usePermission(ModuleKey.PROJECTS);
  const { canWrite: canWriteIssues } = usePermission(ModuleKey.PROJECT_ISSUES);
  const { canWrite: canMoveIssues } = usePermission(
    ModuleKey.PROJECT_MOVE_ISSUES,
  );
  const { canWrite: canEditSprints } = usePermission(ModuleKey.PROJECT_SPRINTS);
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  const deleteIssue = useDeleteIssue();
  const isCreating = issue === undefined;
  const [isEditing, setIsEditing] = useState(isCreating);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);

  function buildDraft(): Draft {
    return {
      title: issue?.title ?? "",
      description: issue?.description ?? "",
      typeId: issue?.typeId ?? defaults?.typeId ?? options.issueTypes[0]?.id ?? 0,
      parentId: issue?.parentId ?? defaults?.parentId ?? null,
      columnId:
        issue?.columnId ??
        columns.find((column) => column.category === BoardColumnCategory.TODO)
          ?.id ??
        columns[0]?.id ??
        0,
      priorityId: issue?.priorityId ?? null,
      difficultyId: issue?.difficultyId ?? null,
      sprintId: issue ? issue.sprintId : defaultSprintId,
      assigneeIds: issue?.assigneeIds ?? [],
      startDate: issue?.startDate ?? "",
      dueDate: issue?.dueDate ?? "",
      estimateHours:
        issue?.estimateMinutes != null ? String(issue.estimateMinutes / 60) : "",
      storyPoints: issue?.storyPoints != null ? String(issue.storyPoints) : "",
    };
  }

  const [draft, setDraft] = useState<Draft>(buildDraft);

  function updateDraft(changes: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  const mutation = isCreating ? createIssue : updateIssue;
  const draftType = options.issueTypes.find((type) => type.id === draft.typeId);
  const isDraftSubtask = draftType?.isSubtask ?? false;
  const selectableSprints = sprints.filter(
    (sprint) =>
      sprint.status !== SprintStatus.CLOSED || sprint.id === issue?.sprintId,
  );
  const parentCandidates = issues.filter(
    (candidate) =>
      candidate.id !== issue?.id &&
      candidate.parentId === null &&
      !options.issueTypes.find((type) => type.id === candidate.typeId)
        ?.isSubtask,
  );

  function startEditing() {
    setDraft(buildDraft());
    updateIssue.reset();
    setIsEditing(true);
  }

  function cancelEditing() {
    if (isCreating) {
      onClose();
      return;
    }

    updateIssue.reset();
    setIsEditing(false);
  }

  const isSaveDisabled =
    mutation.isPending ||
    draft.title.trim() === "" ||
    (isDraftSubtask && draft.parentId === null);

  function handleSave() {
    if (isSaveDisabled) return;

    const input: SaveIssueRequestDto = {
      title: draft.title,
      description: draft.description,
      typeId: draft.typeId,
      parentId: isDraftSubtask ? draft.parentId : null,
      priorityId: draft.priorityId,
      difficultyId: draft.difficultyId,
      columnId: draft.columnId,
      sprintId: isDraftSubtask ? undefined : draft.sprintId,
      assigneeIds: draft.assigneeIds,
      startDate: draft.startDate || null,
      dueDate: draft.dueDate || null,
      estimateMinutes:
        draft.estimateHours === ""
          ? null
          : Math.round(Number(draft.estimateHours) * 60),
      storyPoints: draft.storyPoints === "" ? null : Number(draft.storyPoints),
    };

    if (issue) {
      updateIssue.mutate(
        { id: project.id, issueId: issue.id, ...input },
        { onSuccess: () => setIsEditing(false) },
      );
    } else {
      createIssue.mutate({ id: project.id, ...input }, { onSuccess: onClose });
    }
  }

  const column = columns.find((item) => item.id === issue?.columnId);
  const sprint = sprints.find((item) => item.id === issue?.sprintId);
  const parent = issues.find((item) => item.id === issue?.parentId);
  const subtasks = issue
    ? issues
        .filter((item) => item.parentId === issue.id)
        .sort((a, b) => a.issueNumber - b.issueNumber)
    : [];
  const isDone = (item: IssueDto) =>
    columns.find((col) => col.id === item.columnId)?.category ===
    BoardColumnCategory.DONE;
  const doneSubtasks = subtasks.filter(isDone);
  const subtaskColumn = (columnId: number) => {
    const subtaskColumnData = columns.find((col) => col.id === columnId);

    return subtaskColumnData ? columnLabel(t, subtaskColumnData) : "";
  };
  const type = options.issueTypes.find((item) => item.id === issue?.typeId);
  const priority = options.priorities.find(
    (item) => item.id === issue?.priorityId,
  );
  const difficulty = options.difficulties.find(
    (item) => item.id === issue?.difficultyId,
  );
  const person = (userId: number) => members.find((item) => item.id === userId);
  const reporter = issue ? person(issue.reporterId) : undefined;
  const assignees = (issue?.assigneeIds ?? [])
    .map(person)
    .filter((member) => member !== undefined);
  const subtaskType = options.issueTypes.find((item) => item.isSubtask);
  const canAddSubtask =
    canWriteIssues &&
    !isEditing &&
    subtaskType !== undefined &&
    parent === undefined &&
    !type?.isSubtask;

  const selectClass = "h-9";
  const dueState = issue
    ? getDueState(issue.dueDate, issue.resolvedAt !== null)
    : null;

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="flex h-[min(90vh,50rem)] flex-col gap-4 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="shrink-0 pr-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <IssueTypeIcon type={isEditing ? draftType : type} />
              {issue ? (
                <span className="font-mono text-sm font-medium text-info">
                  {issue.issueKey}
                </span>
              ) : (
                <span className="text-sm font-medium">
                  {t("issues.dialog.newTitle")}
                </span>
              )}
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  loading={mutation.isPending}
                  disabled={isSaveDisabled}
                  onClick={handleSave}
                >
                  {t(issue ? "common.saveChanges" : "issues.dialog.create")}
                </Button>
              </div>
            ) : (
              canWriteIssues && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startEditing}
                  >
                    <Pencil />
                    {t("common.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    <Trash2 />
                    {t("common.delete")}
                  </Button>
                </div>
              )
            )}
          </div>
          {isEditing ? (
            <>
              <DialogTitle className="sr-only">
                {issue
                  ? t("issues.dialog.editingTitle", { key: issue.issueKey })
                  : t("issues.dialog.newTitle")}
              </DialogTitle>
              <Input
                aria-label={t("issues.dialog.titleLabel")}
                placeholder={t("issues.dialog.titlePlaceholder")}
                value={draft.title}
                maxLength={ISSUE_TITLE_MAX_LENGTH}
                autoFocus
                className="h-11 text-lg font-semibold"
                onChange={(event) =>
                  updateDraft({ title: event.currentTarget.value })
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSave();
                  }
                }}
              />
            </>
          ) : (
            <DialogTitle className="text-2xl leading-snug font-bold tracking-tight [overflow-wrap:anywhere]">
              {issue?.title}
            </DialogTitle>
          )}
          <DialogDescription className="text-sm">
            {!isEditing && parent ? (
              <span className="inline-flex items-center gap-1.5">
                <CornerDownRight className="size-3.5" aria-hidden="true" />
                {t("issues.dialog.subtaskOf")}{" "}
                <NavLink
                  to={`/projects/${project.id}/issues/${parent.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {parent.issueKey} · {parent.title}
                </NavLink>
              </span>
            ) : isCreating ? (
              t("issues.dialog.createdIn", {
                key: project.projectKey,
                name: project.name,
              })
            ) : (
              <span className="sr-only">
                {t("issues.dialog.viewDescription", {
                  key: project.projectKey,
                })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>


        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_16rem] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
          <div className="flex min-w-0 flex-col gap-7 lg:overflow-y-auto lg:pr-2">
            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">
                {t("issues.dialog.description")}
              </h2>
              {isEditing ? (
                <>
                  <Textarea
                    aria-label={t("issues.dialog.description")}
                    value={draft.description}
                    maxLength={ISSUE_DESCRIPTION_MAX_LENGTH}
                    className="h-32 resize-none"
                    onChange={(event) =>
                      updateDraft({ description: event.currentTarget.value })
                    }
                  />
                  <span className="self-end text-xs text-muted-foreground">
                    {draft.description.length} / {ISSUE_DESCRIPTION_MAX_LENGTH}
                  </span>
                </>
              ) : issue?.description ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] text-foreground/90">
                  {issue.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("issues.dialog.noDescription")}
                </p>
              )}
            </section>

            {issue && (
              <IssueAttachments
                issue={{ id: project.id, issueId: issue.id }}
                canWrite={canWriteIssues && isEditing}
              />
            )}

            {issue && (subtasks.length > 0 || canAddSubtask) && (
              <section className="flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="flex items-baseline gap-2 text-sm font-semibold">
                    {t("issues.dialog.subtasks")}
                    {subtasks.length > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {t("issues.dialog.subtasksDone", {
                          done: doneSubtasks.length,
                          total: subtasks.length,
                        })}
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
                    aria-label={t("issues.dialog.subtasksProgress")}
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
                        to={`/projects/${project.id}/issues/${subtask.id}`}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary/60"
                      >
                        {isDone(subtask) ? (
                          <CircleCheck
                            className="size-4 shrink-0 text-success"
                            aria-label={t("issues.dialog.completed")}
                          />
                        ) : (
                          <Circle
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-label={t("issues.dialog.pending")}
                          />
                        )}
                        <span className="font-mono text-xs text-muted-foreground">
                          {subtask.issueKey}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {subtask.title}
                        </span>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs">
                          {subtaskColumn(subtask.columnId)}
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
                    onClick={() => setIsCreatingSubtask(true)}
                  >
                    <Plus />
                    {t("issues.dialog.newSubtask")}
                  </Button>
                )}
              </section>
            )}

            {issue && (
              <IssueComments
                issue={{ id: project.id, issueId: issue.id }}
                currentUserId={user?.id}
                canWrite={canWrite}
              />
            )}
          </div>

          <aside className="h-fit rounded-xl border border-border bg-muted/40 p-4 lg:max-h-full lg:overflow-y-auto">
            <dl className="flex flex-col gap-4">
              <Detail label={t("issues.dialog.status")}>
                {isEditing && (isCreating || canMoveIssues) ? (
                  <NativeSelect
                    aria-label={t("issues.dialog.status")}
                    className={selectClass}
                    value={draft.columnId}
                    onChange={(event) =>
                      updateDraft({
                        columnId: Number(event.currentTarget.value),
                      })
                    }
                  >
                    {columns.map((item) => (
                      <option key={item.id} value={item.id}>
                        {columnLabel(t, item)}
                      </option>
                    ))}
                  </NativeSelect>
                ) : (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full bg-primary"
                      style={
                        column?.color
                          ? { backgroundColor: column.color }
                          : undefined
                      }
                    />
                    {column ? columnLabel(t, column) : t("common.none")}
                  </>
                )}
              </Detail>
              <Detail label={t("issues.dialog.assignees")}>
                {isEditing ? (
                  <UserMultiSelectComponent
                    users={members}
                    values={draft.assigneeIds}
                    onChange={(assigneeIds) => updateDraft({ assigneeIds })}
                    placeholder={t("common.unassigned")}
                    ariaLabel={t("issues.dialog.assignees")}
                  />
                ) : assignees.length > 0 ? (
                  <span className="flex flex-col gap-2">
                    {assignees.map((member) => (
                      <span key={member.id} className="flex items-center gap-2">
                        <AssigneeStack people={[member]} />
                        {member.name} {member.lastName}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {t("common.unassigned")}
                  </span>
                )}
              </Detail>
              <Detail label={t("issues.dialog.priority")}>
                {isEditing ? (
                  <NativeSelect
                    aria-label={t("issues.dialog.priority")}
                    className={selectClass}
                    value={draft.priorityId ?? ""}
                    onChange={(event) =>
                      updateDraft({
                        priorityId: toNumberOrNull(event.currentTarget.value),
                      })
                    }
                  >
                    <option value="">{t("issues.dialog.noPriority")}</option>
                    {options.priorities.map((item) => (
                      <option key={item.id} value={item.id}>
                        {priorityLabel(t, item)}
                      </option>
                    ))}
                  </NativeSelect>
                ) : priority ? (
                  <>
                    <PriorityIcon priority={priority} />
                    {priorityLabel(t, priority)}
                  </>
                ) : (
                  "—"
                )}
              </Detail>
              <div className="grid grid-cols-2 gap-4">
                <Detail label={t("issues.dialog.type")}>
                  {isEditing ? (
                    <NativeSelect
                      aria-label={t("issues.dialog.type")}
                      className={selectClass}
                      value={draft.typeId}
                      onChange={(event) =>
                        updateDraft({
                          typeId: Number(event.currentTarget.value),
                        })
                      }
                    >
                      {options.issueTypes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {issueTypeLabel(t, item)}
                        </option>
                      ))}
                    </NativeSelect>
                  ) : (
                    (type ? issueTypeLabel(t, type) : t("common.none"))
                  )}
                </Detail>
                <Detail label={t("issues.dialog.difficulty")}>
                  {isEditing ? (
                    <NativeSelect
                      aria-label={t("issues.dialog.difficulty")}
                      className={selectClass}
                      value={draft.difficultyId ?? ""}
                      onChange={(event) =>
                        updateDraft({
                          difficultyId: toNumberOrNull(
                            event.currentTarget.value,
                          ),
                        })
                      }
                    >
                      <option value="">—</option>
                      {options.difficulties.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                  ) : (
                    <span className="font-mono text-[0.8125rem]">
                      {difficulty?.name ?? t("common.none")}
                    </span>
                  )}
                </Detail>
              </div>
              {isEditing && isDraftSubtask ? (
                <Detail label={t("issues.dialog.parent")}>
                  <NativeSelect
                    aria-label={t("issues.dialog.parent")}
                    className={selectClass}
                    value={draft.parentId ?? ""}
                    onChange={(event) =>
                      updateDraft({
                        parentId: toNumberOrNull(event.currentTarget.value),
                      })
                    }
                  >
                    <option value="">{t("issues.dialog.selectIssue")}</option>
                    {parentCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.issueKey} · {candidate.title}
                      </option>
                    ))}
                  </NativeSelect>
                </Detail>
              ) : (
                <Detail label={t("issues.dialog.sprint")}>
                  {isEditing && (isCreating || canEditSprints) ? (
                    <NativeSelect
                      aria-label={t("issues.dialog.sprint")}
                      className={selectClass}
                      value={draft.sprintId ?? ""}
                      onChange={(event) =>
                        updateDraft({
                          sprintId: toNumberOrNull(event.currentTarget.value),
                        })
                      }
                    >
                      <option value="">{t("common.backlog")}</option>
                      {selectableSprints.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </NativeSelect>
                  ) : (
                    (sprint?.name ?? t("common.backlog"))
                  )}
                </Detail>
              )}
              <Detail label={t("issues.dialog.startDate")}>
                {isEditing ? (
                  <Input
                    type="date"
                    aria-label={t("issues.dialog.startDate")}
                    className={selectClass}
                    value={draft.startDate}
                    max={draft.dueDate || undefined}
                    onChange={(event) =>
                      updateDraft({ startDate: event.currentTarget.value })
                    }
                  />
                ) : issue?.startDate ? (
                  formatDate(issue.startDate, locale)
                ) : (
                  t("issues.dialog.noDate")
                )}
              </Detail>
              <Detail label={t("issues.dialog.dueDate")}>
                {isEditing ? (
                  <Input
                    type="date"
                    aria-label={t("issues.dialog.dueDate")}
                    className={selectClass}
                    value={draft.dueDate}
                    min={draft.startDate || undefined}
                    onChange={(event) =>
                      updateDraft({ dueDate: event.currentTarget.value })
                    }
                  />
                ) : issue?.dueDate ? (
                  <span
                    className={cn(
                      "flex flex-wrap items-center gap-x-2",
                      dueState === "overdue" && "font-medium text-destructive",
                      dueState === "soon" && "font-medium text-warning",
                    )}
                  >
                    {formatDate(issue.dueDate, locale)}
                    {dueState && (
                      <span className="text-xs">
                        {t(
                          dueState === "overdue"
                            ? "issues.dialog.overdue"
                            : "issues.dialog.dueSoon",
                        )}
                      </span>
                    )}
                  </span>
                ) : (
                  t("issues.dialog.noDate")
                )}
              </Detail>
              <Detail label={t("issues.dialog.estimate")}>
                {isEditing ? (
                  <Input
                    type="number"
                    inputMode="decimal"
                    aria-label={t("issues.dialog.estimate")}
                    className={selectClass}
                    min={0}
                    max={ISSUE_ESTIMATE_MAX_MINUTES / 60}
                    step={0.25}
                    placeholder={t("issues.dialog.estimateHours")}
                    value={draft.estimateHours}
                    onChange={(event) =>
                      updateDraft({ estimateHours: event.currentTarget.value })
                    }
                  />
                ) : issue?.estimateMinutes != null ? (
                  formatEstimate(issue.estimateMinutes)
                ) : (
                  t("common.none")
                )}
              </Detail>
              <Detail label={t("issues.dialog.storyPoints")}>
                {isEditing ? (
                  <Input
                    type="number"
                    inputMode="numeric"
                    aria-label={t("issues.dialog.storyPoints")}
                    className={selectClass}
                    min={1}
                    max={ISSUE_STORY_POINTS_MAX}
                    step={1}
                    value={draft.storyPoints}
                    onKeyDown={(event) => {
                      if (["-", "+", ".", ",", "e", "E"].includes(event.key)) {
                        event.preventDefault();
                      }
                    }}
                    onChange={(event) => {
                      const digits = event.currentTarget.value
                        .replace(/\D/g, "")
                        .replace(/^0+/, "");

                      updateDraft({
                        storyPoints: String(
                          Math.min(Number(digits), ISSUE_STORY_POINTS_MAX),
                        ).replace(/^0$/, ""),
                      });
                    }}
                  />
                ) : issue?.storyPoints != null ? (
                  issue.storyPoints
                ) : (
                  t("common.none")
                )}
              </Detail>
              {issue && (
                <div className="flex flex-col gap-3 border-t border-border pt-4 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      {t("issues.dialog.reporter")}
                    </span>
                    <span className="text-right">
                      {reporter
                        ? `${reporter.name} ${reporter.lastName}`
                        : t("issues.dialog.userFallback", { id: issue.reporterId })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">
                      {t("issues.dialog.resolved")}
                    </span>
                    <span className="text-right">
                      {issue.resolvedAt
                        ? new Date(issue.resolvedAt).toLocaleString(locale)
                        : "—"}
                    </span>
                  </div>
                </div>
              )}
            </dl>
          </aside>
        </div>

        {issue && (
          <ConfirmDialogComponent
            open={isConfirmingDelete}
            title={t("issues.dialog.deleteDialog.title", { key: issue.issueKey })}
            description={
              subtasks.length > 0
                ? t("issues.dialog.deleteDialog.withSubtasks", {
                    count: subtasks.length,
                  })
                : t("issues.dialog.deleteDialog.simple")
            }
            confirmLabel={t("issues.dialog.deleteDialog.confirm")}
            isPending={deleteIssue.isPending}
            destructive
            onClose={() => setIsConfirmingDelete(false)}
            onConfirm={() =>
              deleteIssue.mutate(
                { id: project.id, issueId: issue.id },
                {
                  onSuccess: onClose,
                  onSettled: () => setIsConfirmingDelete(false),
                },
              )
            }
          />
        )}

        {issue && isCreatingSubtask && subtaskType && (
          <IssueDialog
            project={project}
            options={options}
            columns={columns}
            issues={issues}
            sprints={sprints}
            members={members}
            defaults={{ typeId: subtaskType.id, parentId: issue.id }}
            onClose={() => setIsCreatingSubtask(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
