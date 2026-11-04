import type { IssueDto, IssueRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toIssueDto } from "../mappers/issue.mapper.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type GetIssueInput = IssueRequestDto & Actor;

export class GetIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
  ) {}

  async execute(input: GetIssueInput): Promise<IssueDto> {
    const project = await requireProjectMember(this.projects, input.id, input.actorUserId);

    const issue = await this.issues.findById({
      id: input.id,
      issueId: input.issueId,
    });

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    return toIssueDto(issue, project.projectKey);
  }
}
