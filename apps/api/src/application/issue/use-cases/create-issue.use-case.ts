import {
  BoardColumnCategory,
  positionAfter,
  type IssueDto,
  type ProjectIdRequestDto,
  type SaveIssueRequestDto,
} from "@orbit/shared";
import { Issue } from "../../../domain/issue/issue.entity.js";
import { InvalidIssueReferenceError } from "../../../domain/issue/issue.errors.js";
import type { ProjectMemberRepository } from "../../project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { SprintRepository } from "../../sprint/ports/sprint-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import { toIssueDto } from "../mappers/issue.mapper.js";
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
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";

export type CreateIssueInput = SaveIssueRequestDto &
  ProjectIdRequestDto & { actorUserId: number };

export class CreateIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly sprints: SprintRepository,
    private readonly members: ProjectMemberRepository,
    private readonly issues: IssueRepository,
    private readonly catalog: IssueCatalogRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: CreateIssueInput): Promise<IssueDto> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
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

    assertParent({ type, types, parentId: input.parentId, parent });

    // Las subtareas siguen el sprint de su padre; el resto elige el suyo.
    const sprintId = type.isSubtask ? parent!.sprintId : (input.sprintId ?? null);

    if (!type.isSubtask && sprintId !== null) {
      const sprint = await this.sprints.findById({ id: input.id, sprintId });

      if (!sprint) {
        throw new InvalidIssueReferenceError("El sprint");
      }

      sprint.assertAcceptsIssues();
    }
    assertPriority(priorities, input.priorityId);
    assertDifficulty(difficulties, input.difficultyId);
    const assigneeIds = normalizeAssignees(members, input.assigneeIds ?? []);
    const column =
      input.columnId !== undefined
        ? findColumn(columns, input.columnId)
        : columns.find((item) => item.category === BoardColumnCategory.TODO);

    if (!column) {
      throw new InvalidIssueReferenceError("La columna");
    }

    return this.transaction.run(async () => {
      const issueNumber = await this.projects.nextIssueNumber({ id: input.id });
      const lastPosition = await this.issues.findLastBoardPosition({
        id: input.id,
        columnId: column.id,
      });
      const issue = Issue.register({
        ...input,
        projectId: input.id,
        issueNumber,
        columnId: column.id,
        sprintId,
        reporterId: input.actorUserId,
        boardPosition: positionAfter(lastPosition),
        assigneeIds,
        isDone: column.category === BoardColumnCategory.DONE,
      });
      const issueId = await this.issues.save(issue, input.actorUserId);
      await this.issues.replaceAssignees({
        issueId,
        userIds: assigneeIds,
        actorUserId: input.actorUserId,
      });

      return toIssueDto(
        Issue.fromPersistence({ ...issue.toPrimitives(), id: issueId }),
        project.projectKey,
      );
    });
  }
}
