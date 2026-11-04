import type { CommentDto, IssueRequestDto } from "@orbit/shared";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { CommentRepository } from "../ports/comment-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type GetCommentsInput = IssueRequestDto & Actor;

export class GetCommentsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly comments: CommentRepository,
  ) {}

  async execute(input: GetCommentsInput): Promise<CommentDto[]> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const issue = await this.issues.findById(input);

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    return this.comments.findAllByIssue(input);
  }
}
