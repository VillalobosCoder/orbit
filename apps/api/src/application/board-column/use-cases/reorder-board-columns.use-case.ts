import type {
  ProjectIdRequestDto,
  ReorderBoardColumnsRequestDto,
} from "@orbit/shared";
import { InvalidBoardColumnOrderError } from "../../../domain/board-column/board-column.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { BoardColumnRepository } from "../ports/board-column-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type ReorderBoardColumnsInput = ReorderBoardColumnsRequestDto &
  ProjectIdRequestDto & Actor;

export class ReorderBoardColumnsUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly columns: BoardColumnRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: ReorderBoardColumnsInput): Promise<void> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const existing = await this.columns.findAllByProject({ id: input.id });
    const requested = new Set(input.columnIds);
    const isPermutation =
      requested.size === input.columnIds.length &&
      requested.size === existing.length &&
      existing.every((column) => requested.has(column.persistedId));

    if (!isPermutation) {
      throw new InvalidBoardColumnOrderError();
    }

    await this.transaction.run(() => this.columns.reorder(input));
  }
}
