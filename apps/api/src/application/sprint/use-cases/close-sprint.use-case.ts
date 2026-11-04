import type { SprintRequestDto } from "@orbit/shared";
import { SprintNotFoundError } from "../../../domain/sprint/sprint.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type CloseSprintInput = SprintRequestDto & Actor;

export class CloseSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
    private readonly issues: IssueRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: CloseSprintInput): Promise<void> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const sprint = await this.sprints.findById(input);

    if (!sprint) {
      throw new SprintNotFoundError(input.sprintId);
    }

    const closed = sprint.close();

    await this.transaction.run(async () => {
      await this.sprints.update(closed, input.actorUserId);
      await this.issues.releaseFromSprint({ ...input, onlyUnfinished: true });
    });
  }
}
