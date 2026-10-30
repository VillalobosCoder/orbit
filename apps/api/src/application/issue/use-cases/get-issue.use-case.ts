import type { IssueDto, IssueRequestDto } from "@orbit/shared";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toIssueDto } from "../mappers/issue.mapper.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import type { Actor } from "../../shared/actor.js";

export type GetIssueInput = IssueRequestDto & Actor;

export class GetIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
  ) {}

  async execute(input: GetIssueInput): Promise<IssueDto> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

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
