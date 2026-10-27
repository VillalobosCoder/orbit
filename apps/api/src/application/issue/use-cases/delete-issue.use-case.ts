import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { IssueRequestDto } from "@orbit/shared";

export type DeleteIssueInput = IssueRequestDto & { actorUserId: number };

export class DeleteIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
  ) {}

  async execute(input: DeleteIssueInput): Promise<void> {
    const isMember = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!isMember) {
      throw new ProjectNotFoundError(input.id);
    }

    await this.issues.delete(input);
  }
}
