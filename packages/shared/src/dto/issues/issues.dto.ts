import type { BoardColumnCategory } from "../../enums/board-column.enum.js";
import type { ProjectIdRequestDto } from "../projects/projects.dto.js";
import type { SprintDto } from "../sprints/sprints.dto.js";

export type BoardColumnDto = {
  id: number;
  name: string;
  category: BoardColumnCategory;
  position: number;
  color: string | null;
  wipLimit: number | null;
};

export type IssueTypeDto = {
  id: number;
  name: string;
  isSubtask: boolean;
  icon: string | null;
};

export type PriorityDto = {
  id: number;
  name: string;
  level: number;
  color: string | null;
};

export type DifficultyDto = {
  id: number;
  name: string;
  level: number;
};

export type IssueDto = {
  id: number;
  projectId: number;
  issueNumber: number;
  issueKey: string;
  title: string;
  description: string | null;
  typeId: number;
  priorityId: number | null;
  difficultyId: number | null;
  parentId: number | null;
  sprintId: number | null;
  columnId: number;
  boardPosition: number;
  reporterId: number;
  assigneeIds: number[];
  resolvedAt: string | null;
};

export type BoardDto = {
  columns: BoardColumnDto[];
  /** Con sprint activo, solo sus issues; sin sprint activo, los del backlog. */
  activeSprint: SprintDto | null;
  issues: IssueDto[];
};

export type IssueOptionsDto = {
  issueTypes: IssueTypeDto[];
  priorities: PriorityDto[];
  difficulties: DifficultyDto[];
};

export type IssueRequestDto = ProjectIdRequestDto & {
  issueId: number;
};

export type SaveIssueRequestDto = {
  title: string;
  description?: string | null;
  typeId: number;
  priorityId?: number | null;
  difficultyId?: number | null;
  parentId?: number | null;
  /** Al crear, sin sprint va al backlog; al editar, sin sprint no cambia. */
  sprintId?: number | null;
  columnId?: number;
  assigneeIds?: number[];
};

export type MoveIssueRequestDto = {
  columnId: number;
  previousIssueId?: number | null;
  nextIssueId?: number | null;
};
