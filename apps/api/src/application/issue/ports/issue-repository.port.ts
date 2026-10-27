import type { IssueRequestDto, ProjectIdRequestDto } from "@orbit/shared";
import type { Issue } from "../../../domain/issue/issue.entity.js";

export type ReplaceAssigneesCommand = {
  issueId: number;
  userIds: number[];
  actorUserId: number;
};

export type FindLastBoardPositionQuery = ProjectIdRequestDto & {
  columnId: number;
};

export type DeleteIssueCommand = IssueRequestDto & {
  actorUserId: number;
};

export interface IssueRepository {
  save(issue: Issue, actorUserId: number): Promise<number>;
  findAllByProject(query: ProjectIdRequestDto): Promise<Issue[]>;
  findById(query: IssueRequestDto): Promise<Issue | null>;
  hasChildren(query: IssueRequestDto): Promise<boolean>;
  findLastBoardPosition(
    query: FindLastBoardPositionQuery,
  ): Promise<number | null>;
  update(issue: Issue, actorUserId: number): Promise<void>;
  replaceAssignees(command: ReplaceAssigneesCommand): Promise<void>;
  delete(command: DeleteIssueCommand): Promise<void>;
}
