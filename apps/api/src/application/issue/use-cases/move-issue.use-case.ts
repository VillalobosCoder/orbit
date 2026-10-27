import {
  BoardColumnCategory,
  computeBoardPosition,
  type IssueRequestDto,
  type MoveIssueRequestDto,
} from "@orbit/shared";
import { InvalidIssueReferenceError, IssueNotFoundError } from "../../../domain/issue/issue.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { IssueCatalogRepository } from "../ports/issue-catalog-repository.port.js";
import type { IssueRepository } from "../ports/issue-repository.port.js";
import { findColumn } from "../utils/validate-issue-references.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";

export type MoveIssueInput = MoveIssueRequestDto &
  IssueRequestDto & { actorUserId: number };

export class MoveIssueUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly issues: IssueRepository,
    private readonly catalog: IssueCatalogRepository,
  ) {}

  async execute(input: MoveIssueInput): Promise<void> {
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

    const column = findColumn(
      await this.catalog.findColumns({ id: input.id }),
      input.columnId,
    );
    const [previous, next] = await Promise.all([
      this.findNeighbor(input, input.previousIssueId),
      this.findNeighbor(input, input.nextIssueId),
    ]);

    await this.issues.update(
      issue.movedTo({
        columnId: column.id,
        boardPosition: computeBoardPosition(previous, next),
        isDone: column.category === BoardColumnCategory.DONE,
      }),
      input.actorUserId,
    );
  }

  private async findNeighbor(
    input: MoveIssueInput,
    neighborId: number | null | undefined,
  ): Promise<number | null> {
    if (neighborId == null) {
      return null;
    }

    const neighbor = await this.issues.findById({
      id: input.id,
      issueId: neighborId,
    });

    if (
      !neighbor ||
      neighbor.id === input.issueId ||
      neighbor.columnId !== input.columnId
    ) {
      throw new InvalidIssueReferenceError("La tarjeta vecina");
    }

    return neighbor.boardPosition;
  }
}
