import type { UpdateIssueRequestDto, IssueRequestDto } from "@orbit/shared";
import type { ProjectMemberRepository } from "../../project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import {
  assertIssueType,
  assertPriority,
  normalizeAssignees,
} from "../utils/validate-issue-references.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import { IssueNotFoundError } from "../../../domain/issue/issue.errors.js";

export type UpdateIssueInput = UpdateIssueRequestDto &
  IssueRequestDto & { actorUserId: number };

export class UpdateIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly members: ProjectMemberRepository,
    private readonly issues: IssueRepository,
    private readonly catalog: IssueCatalogRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: UpdateIssueInput): Promise<void> {
    const isMember = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!isMember) {
      throw new ProjectNotFoundError(input.id);
    }

    const issue = await this.issues.findById({
      id: input.id,
      issueId: input.issueId,
    });

    if (!issue) {
      throw new IssueNotFoundError(input.issueId);
    }

    const [types, priorities, members] = await Promise.all([
      this.catalog.findIssueTypes({ id: input.id }),
      this.catalog.findPriorities({ id: input.id }),
      this.members.findMembers({ id: input.id }),
    ]);

    assertIssueType(types, input.typeId);
    assertPriority(priorities, input.priorityId);
    const assigneeIds =
      input.assigneeIds === undefined
        ? undefined
        : normalizeAssignees(members, input.assigneeIds);

    await this.transaction.run(async () => {
      await this.issues.update(issue.withDetails(input), input.actorUserId);

      if (assigneeIds !== undefined) {
        await this.issues.replaceAssignees({
          issueId: input.issueId,
          userIds: assigneeIds,
          actorUserId: input.actorUserId,
        });
      }
    });
  }
}
