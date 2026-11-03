import type { AttachmentDto, IssueRequestDto } from "@orbit/shared";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { AttachmentRepository } from "../ports/attachment-repository.port.js";

export type GetAttachmentsInput = IssueRequestDto & Actor;

export class GetAttachmentsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly attachments: AttachmentRepository,
  ) {}

  async execute(input: GetAttachmentsInput): Promise<AttachmentDto[]> {
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

    return this.attachments.findAllByIssue(input);
  }
}
