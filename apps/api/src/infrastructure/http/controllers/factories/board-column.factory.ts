import { BoardColumnController } from "../board-column.controller.js";
import { CreateBoardColumnUseCase } from "../../../../application/board-column/use-cases/create-board-column.use-case.js";
import { DeleteBoardColumnUseCase } from "../../../../application/board-column/use-cases/delete-board-column.use-case.js";
import { ReorderBoardColumnsUseCase } from "../../../../application/board-column/use-cases/reorder-board-columns.use-case.js";
import { UpdateBoardColumnUseCase } from "../../../../application/board-column/use-cases/update-board-column.use-case.js";
import type { ControllerDependencies } from "../dependencies.js";

export function createBoardColumnController(dependencies: ControllerDependencies) {
  return new BoardColumnController(
    new CreateBoardColumnUseCase(
      dependencies.projectRepository,
      dependencies.boardColumnRepository,
    ),
    new UpdateBoardColumnUseCase(
      dependencies.projectRepository,
      dependencies.boardColumnRepository,
    ),
    new ReorderBoardColumnsUseCase(
      dependencies.projectRepository,
      dependencies.boardColumnRepository,
      dependencies.transaction,
    ),
    new DeleteBoardColumnUseCase(
      dependencies.projectRepository,
      dependencies.boardColumnRepository,
      dependencies.transaction,
    ),
  );
}
