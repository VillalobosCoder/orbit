import type { BoardColumnCategory } from "../../enums/board-column.enum.js";

export const HOME_ASSIGNED_ISSUES_LIMIT = 8;

export type HomeAssignedIssueDto = {
  id: number;
  issueKey: string;
  title: string;
  projectId: number;
  columnName: string;
  category: BoardColumnCategory;
};

export type HomeActiveSprintDto = {
  id: number;
  name: string;
  endDate: string | null;
  totalIssues: number;
  doneIssues: number;
};

export type HomeProjectDto = {
  id: number;
  projectKey: string;
  name: string;
  activeSprint: HomeActiveSprintDto | null;
  backlogIssues: number;
};

export type HomeSummaryDto = {
  projects: HomeProjectDto[];
  assigned: {
    total: number;
    inProgress: number;
    items: HomeAssignedIssueDto[];
  };
};
