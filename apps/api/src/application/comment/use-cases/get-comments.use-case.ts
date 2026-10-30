import type { CommentDto, IssueRequestDto } from "@orbit/shared";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { CommentRepository } from "../ports/comment-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type GetCommentsInput = IssueRequestDto & Actor;

export class GetCommentsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly comments: CommentRepository,
  ) {}

  async execute(input: GetCommentsInput): Promise<CommentDto[]> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const issue = await this.issues.findById(input);

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    return this.comments.findAllByIssue(input);
  }
}
