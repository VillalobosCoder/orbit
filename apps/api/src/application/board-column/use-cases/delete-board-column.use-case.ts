import {
  BoardColumnCategory,
  type BoardColumnRequestDto,
  type DeleteBoardColumnRequestDto,
} from "@orbit/shared";
import {
  BoardColumnNotFoundError,
  InvalidBoardColumnTargetError,
} from "../../../domain/board-column/board-column.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { TransactionManager } from "../../shared/ports/transaction-manager.port.js";
import type { BoardColumnRepository } from "../ports/board-column-repository.port.js";
import type { Actor } from "../../shared/actor.js";

export type DeleteBoardColumnInput = DeleteBoardColumnRequestDto &
  BoardColumnRequestDto & Actor;

export class DeleteBoardColumnUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly columns: BoardColumnRepository,
    private readonly transaction: TransactionManager,
  ) {}

  async execute(input: DeleteBoardColumnInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const siblings = await this.columns.findAllByProject({ id: input.id });
    const column = siblings.find((item) => item.id === input.columnId);

    if (!column) {
      throw new BoardColumnNotFoundError(input.columnId);
    }

    const target = siblings.find(
      (item) => item.id === input.moveIssuesToColumnId,
    );

    if (!target || target.id === column.id) {
      throw new InvalidBoardColumnTargetError();
    }

    column.assertRemovable(siblings);

    await this.transaction.run(async () => {
      await this.columns.moveIssues({
        id: input.id,
        fromColumnId: column.id!,
        toColumnId: target.id!,
        toIsDone: target.category === BoardColumnCategory.DONE,
        actorUserId: input.actorUserId,
      });
      await this.columns.delete(input);
    });
  }
}
