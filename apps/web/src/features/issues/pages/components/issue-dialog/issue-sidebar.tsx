import type { ReactNode } from "react";
import { cn } from "cn";
import {
  ISSUE_ESTIMATE_MAX_MINUTES,
  ISSUE_STORY_POINTS_MAX,
  SprintStatus,
  type BoardColumnDto,
  type IssueDto,
  type IssueOptionsDto,
  type ProjectMemberDto,
  type SprintDto,
} from "@orbit/shared";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { UserMultiSelectComponent } from "@/components/ui/user-multi-select-component";
import { columnLabel, issueTypeLabel, priorityLabel } from "@/i18n/catalog";
import { useI18n } from "@/i18n/use-i18n";
import { formatDate, formatEstimate, getDueState } from "../../../utils/due-date";
import { toNumberOrNull, type IssueDraft } from "./issue-draft";
import { AssigneeStack, PriorityIcon } from "../shared/issue-visuals";

const selectClass = "h-9";

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 text-sm">{children}</dd>
    </div>
  );
}

interface IssueSidebarProps {
  issue?: IssueDto;
  draft: IssueDraft;
  onChange: (changes: Partial<IssueDraft>) => void;
  isEditing: boolean;
  isCreating: boolean;
  options: IssueOptionsDto;
  columns: BoardColumnDto[];
  sprints: SprintDto[];
  members: ProjectMemberDto[];
  parentCandidates: IssueDto[];
  isDraftSubtask: boolean;
  canMoveIssues: boolean;
  canEditSprints: boolean;
}

export default function IssueSidebar({
  issue,
  draft,
  onChange: updateDraft,
  isEditing,
  isCreating,
  options,
  columns,
  sprints,
  members,
  parentCandidates,
  isDraftSubtask,
  canMoveIssues,
  canEditSprints,
}: IssueSidebarProps) {
  const { t, locale } = useI18n();
  const column = columns.find((item) => item.id === issue?.columnId);
  const sprint = sprints.find((item) => item.id === issue?.sprintId);
  const selectableSprints = sprints.filter(
    (item) => item.status !== SprintStatus.CLOSED || item.id === issue?.sprintId,
  );
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
  const dueState = issue
    ? getDueState(issue.dueDate, issue.resolvedAt !== null)
    : null;

  return (
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
  );
}
