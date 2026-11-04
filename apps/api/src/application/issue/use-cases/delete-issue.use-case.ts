import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import type { IssueRequestDto } from "@orbit/shared";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type DeleteIssueInput = IssueRequestDto & Actor;

export class DeleteIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: DeleteIssueInput): Promise<void> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    await this.transaction.run(() => this.issues.delete(input));
  }
}
