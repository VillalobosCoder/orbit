import {
  BoardColumnCategory,
  type CreateIssueRequestDto,
  type IssueDto,
  type ProjectIdRequestDto,
} from "@orbit/shared";
import { positionAfter } from "../utils/board-position.js";
import { Issue } from "../../../domain/issue/issue.entity.js";
import { InvalidIssueReferenceError } from "../../../domain/issue/issue.errors.js";
import type { ProjectMemberRepository } from "../../project/ports/project-member-repository.port.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import { toIssueDto } from "../mappers/issue.mapper.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import {
  assertIssueType,
  assertPriority,
  findColumn,
  normalizeAssignees,
} from "../utils/validate-issue-references.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";

export type CreateIssueInput = CreateIssueRequestDto &
  ProjectIdRequestDto & { actorUserId: number };

export class CreateIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
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

    const [columns, types, priorities, members] = await Promise.all([
      this.catalog.findColumns({ id: input.id }),
      this.catalog.findIssueTypes({ id: input.id }),
      this.catalog.findPriorities({ id: input.id }),
      this.members.findMembers({ id: input.id }),
    ]);

    assertIssueType(types, input.typeId);
    assertPriority(priorities, input.priorityId);
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
