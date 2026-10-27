import {
  BoardColumnCategory,
  positionAfter,
  type IssueRequestDto,
  type SaveIssueRequestDto,
} from "@orbit/shared";
import {
  InvalidIssueParentError,
  InvalidIssueReferenceError,
  IssueNotFoundError,
} from "../../../domain/issue/issue.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectMemberRepository } from "../../project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { SprintRepository } from "../../sprint/ports/sprint-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import {
  assertDifficulty,
  assertParent,
  assertPriority,
  findColumn,
  findIssueType,
  normalizeAssignees,
} from "../utils/validate-issue-references.js";

export type UpdateIssueInput = SaveIssueRequestDto &
  IssueRequestDto & { actorUserId: number };

export class UpdateIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
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

    const [columns, types, priorities, difficulties, members] =
      await Promise.all([
        this.catalog.findColumns({ id: input.id }),
        this.catalog.findIssueTypes({ id: input.id }),
        this.catalog.findPriorities({ id: input.id }),
        this.catalog.findDifficulties(),
        this.members.findMembers({ id: input.id }),
      ]);

    const type = findIssueType(types, input.typeId);
    const parent =
      input.parentId != null
        ? await this.issues.findById({ id: input.id, issueId: input.parentId })
        : null;

    assertParent({
      type,
      types,
      parentId: input.parentId,
      parent,
      issueId: input.issueId,
    });

    if (type.isSubtask && (await this.issues.hasChildren(input))) {
      throw new InvalidIssueParentError(
        "Un issue con subtareas no puede convertirse en subtarea.",
      );
    }
    assertPriority(priorities, input.priorityId);
    assertDifficulty(difficulties, input.difficultyId);
    const assigneeIds =
      input.assigneeIds === undefined
        ? undefined
        : normalizeAssignees(members, input.assigneeIds);

    await this.transaction.run(async () => {
      let updated = issue.withDetails(input);
      let sprintChanged = false;

      // Las subtareas siguen el sprint de su padre; el resto cambia solo si se pide.
      if (type.isSubtask) {
        updated = updated.withSprint(parent!.sprintId);
      } else if (
        input.sprintId !== undefined &&
        input.sprintId !== issue.sprintId
      ) {
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

        updated = updated.withSprint(input.sprintId);
        sprintChanged = true;
      }

      if (input.columnId !== undefined && input.columnId !== issue.columnId) {
        const column = findColumn(columns, input.columnId);
        const lastPosition = await this.issues.findLastBoardPosition({
          id: input.id,
          columnId: column.id,
        });

        updated = updated.movedTo({
          columnId: column.id,
          boardPosition: positionAfter(lastPosition),
          isDone: column.category === BoardColumnCategory.DONE,
        });
      }

      await this.issues.update(updated, input.actorUserId);

      if (sprintChanged) {
        await this.issues.setChildrenSprint({
          id: input.id,
          issueId: input.issueId,
          sprintId: updated.sprintId,
          actorUserId: input.actorUserId,
        });
      }

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
