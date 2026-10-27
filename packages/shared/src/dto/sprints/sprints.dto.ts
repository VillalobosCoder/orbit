import type { SprintStatus } from "../../enums/sprint.enum.js";
import type { BoardColumnDto, IssueDto } from "../issues/issues.dto.js";
import type { ProjectIdRequestDto } from "../projects/projects.dto.js";

export type SprintDto = {
  id: number;
  name: string;
  goal: string | null;
  /** Fechas de calendario `YYYY-MM-DD`, sin hora. */
  startDate: string | null;
  endDate: string | null;
  status: SprintStatus;
};

export type SaveSprintRequestDto = {
  name: string;
  goal?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type SprintRequestDto = ProjectIdRequestDto & {
  sprintId: number;
};

export type AssignSprintRequestDto = {
  /** Nulo devuelve el issue al backlog. */
  sprintId: number | null;
};

/** Todo lo que necesita la pantalla de backlog y sprints. */
export type PlanningDto = {
  sprints: SprintDto[];
  columns: BoardColumnDto[];
  issues: IssueDto[];
};
