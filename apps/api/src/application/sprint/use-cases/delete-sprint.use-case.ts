import type { SprintRequestDto } from "@orbit/shared";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import { SprintNotFoundError } from "../../../domain/sprint/sprint.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";

export type DeleteSprintInput = SprintRequestDto & { actorUserId: number };

export class DeleteSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
    private readonly issues: IssueRepository,
    private readonly transaction: TransactionManager,
  ) {}

  /** Sus issues vuelven al backlog. */
  async execute(input: DeleteSprintInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const sprint = await this.sprints.findById(input);

    if (!sprint) {
      throw new SprintNotFoundError(input.sprintId);
    }

    sprint.assertDeletable();

    await this.transaction.run(async () => {
      await this.issues.releaseFromSprint({ ...input, onlyUnfinished: false });
      await this.sprints.delete(input);
    });
  }
}
