import type { AttachmentDto, IssueRequestDto } from "@orbit/shared";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import type { AttachmentRepository } from "../ports/attachment-repository.port.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type GetAttachmentsInput = IssueRequestDto & Actor;

export class GetAttachmentsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly attachments: AttachmentRepository,
  ) {}

  async execute(input: GetAttachmentsInput): Promise<AttachmentDto[]> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const issue = await this.issues.findById(input);

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    return this.attachments.findAllByIssue(input);
  }
}
