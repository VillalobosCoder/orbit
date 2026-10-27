import type {
  AssignSprintRequestDto,
  IssueRequestDto,
} from "@orbit/shared";
import {
  InvalidIssueParentError,
  InvalidIssueReferenceError,
  IssueNotFoundError,
} from "../../../domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { IssueRepository } from "../../issue/ports/issue-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { SprintRepository } from "../ports/sprint-repository.port.js";

export type AssignIssueSprintInput = AssignSprintRequestDto &
  IssueRequestDto & { actorUserId: number };

export class AssignIssueSprintUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
    private readonly issues: IssueRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: AssignIssueSprintInput): Promise<void> {
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

    if (issue.parentId !== null) {
      throw new InvalidIssueParentError(
        "Las subtareas siguen el sprint de su issue padre.",
      );
    }

    if (input.sprintId !== null) {
      const sprint = await this.sprints.findById({
        id: input.id,
        sprintId: input.sprintId,
      });

      if (!sprint) {
        throw new InvalidIssueReferenceError("El sprint");
      }

      sprint.assertAcceptsIssues();
    }

    await this.transaction.run(async () => {
      await this.issues.update(
        issue.withSprint(input.sprintId),
        input.actorUserId,
      );
      await this.issues.setChildrenSprint({
        id: input.id,
        issueId: input.issueId,
        sprintId: input.sprintId,
        actorUserId: input.actorUserId,
      });
    });
  }
}
