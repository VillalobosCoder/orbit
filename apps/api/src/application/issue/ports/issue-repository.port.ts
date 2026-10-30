import type {
  IssueRequestDto,
  ProjectIdRequestDto,
  SprintRequestDto,
} from "@orbit/shared";
import type { Issue } from "../../../domain/issue/issue.entity.js";
import type { Actor } from "../../shared/actor.js";

export type ReplaceAssigneesCommand = Actor & {
  issueId: number;
  userIds: number[];
};

export type FindLastBoardPositionQuery = ProjectIdRequestDto & {
  columnId: number;
};

export type DeleteIssueCommand = IssueRequestDto & Actor;

export type FindIssuesQuery = ProjectIdRequestDto & {
  /** Sin este campo, todos; con un id, los de ese sprint; con `null`, los del backlog. */
  sprintId?: number | null;
};

export type SetChildrenSprintCommand = IssueRequestDto & Actor & {
  sprintId: number | null;
};

export type ReleaseFromSprintCommand = SprintRequestDto & Actor & {
  /** Solo los que no están en una columna `done`. */
  onlyUnfinished: boolean;
};

export interface IssueRepository {
  save(issue: Issue, actorUserId: number): Promise<number>;
  findAllByProject(query: FindIssuesQuery): Promise<Issue[]>;
  findById(query: IssueRequestDto): Promise<Issue | null>;
  hasChildren(query: IssueRequestDto): Promise<boolean>;
  findLastBoardPosition(
    query: FindLastBoardPositionQuery,
  ): Promise<number | null>;
  update(issue: Issue, actorUserId: number): Promise<void>;
  replaceAssignees(command: ReplaceAssigneesCommand): Promise<void>;
  delete(command: DeleteIssueCommand): Promise<void>;
  setChildrenSprint(command: SetChildrenSprintCommand): Promise<void>;
  releaseFromSprint(command: ReleaseFromSprintCommand): Promise<void>;
}
