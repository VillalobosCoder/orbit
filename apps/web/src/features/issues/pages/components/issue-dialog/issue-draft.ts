import {
  BoardColumnCategory,
  type BoardColumnDto,
  type IssueDto,
  type IssueOptionsDto,
  type SaveIssueRequestDto,
} from "@orbit/shared";

export type IssueDraft = {
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

export function toNumberOrNull(value: string) {
  return value ? Number(value) : null;
}

export function buildIssueDraft({
  issue,
  defaults,
  defaultSprintId,
  options,
  columns,
}: {
  issue?: IssueDto;
  defaults?: { typeId?: number; parentId?: number };
  defaultSprintId: number | null;
  options: IssueOptionsDto;
  columns: BoardColumnDto[];
}): IssueDraft {
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

export function toSaveIssueInput(
  draft: IssueDraft,
  isSubtask: boolean,
): SaveIssueRequestDto {
  return {
    title: draft.title,
    description: draft.description,
    typeId: draft.typeId,
    parentId: isSubtask ? draft.parentId : null,
    priorityId: draft.priorityId,
    difficultyId: draft.difficultyId,
    columnId: draft.columnId,
    sprintId: isSubtask ? undefined : draft.sprintId,
    assigneeIds: draft.assigneeIds,
    startDate: draft.startDate || null,
    dueDate: draft.dueDate || null,
    estimateMinutes:
      draft.estimateHours === ""
        ? null
        : Math.round(Number(draft.estimateHours) * 60),
    storyPoints: draft.storyPoints === "" ? null : Number(draft.storyPoints),
  };
}
