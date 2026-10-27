import type {
  ProjectIdRequestDto,
  ReorderBoardColumnsRequestDto,
} from "@orbit/shared";
import { InvalidBoardColumnOrderError } from "../../../domain/board-column/board-column.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { BoardColumnRepository } from "../ports/board-column-repository.port.js";

export type ReorderBoardColumnsInput = ReorderBoardColumnsRequestDto &
  ProjectIdRequestDto & { actorUserId: number };

export class ReorderBoardColumnsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly columns: BoardColumnRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: ReorderBoardColumnsInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const existing = await this.columns.findAllByProject({ id: input.id });
    const requested = new Set(input.columnIds);
    const isPermutation =
      requested.size === input.columnIds.length &&
      requested.size === existing.length &&
      existing.every((column) => requested.has(column.id!));

    if (!isPermutation) {
      throw new InvalidBoardColumnOrderError();
    }

    await this.transaction.run(() => this.columns.reorder(input));
  }
}
