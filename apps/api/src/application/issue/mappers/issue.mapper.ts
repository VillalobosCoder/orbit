import type { IssueDto } from "@orbit/shared";
import type { Issue } from "../../../domain/issue/issue.entity.js";

export function toIssueDto(issue: Issue, projectKey: string): IssueDto {
  return {
    id: issue.id!,
    projectId: issue.projectId,
    issueNumber: issue.issueNumber,
    issueKey: `${projectKey}-${issue.issueNumber}`,
    title: issue.title,
    description: issue.description,
    typeId: issue.typeId,
    priorityId: issue.priorityId,
    difficultyId: issue.difficultyId,
    parentId: issue.parentId,
    sprintId: issue.sprintId,
    columnId: issue.columnId,
    boardPosition: issue.boardPosition,
    reporterId: issue.reporterId,
    assigneeIds: issue.assigneeIds,
    resolvedAt: issue.resolvedAt?.toISOString() ?? null,
  };
}
