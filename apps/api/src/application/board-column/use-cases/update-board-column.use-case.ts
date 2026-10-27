import type {
  BoardColumnRequestDto,
  SaveBoardColumnRequestDto,
} from "@orbit/shared";
import { BoardColumnNotFoundError } from "../../../domain/board-column/board-column.errors.js";
import { ProjectNotFoundError } from "../../../domain/project/project.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { BoardColumnRepository } from "../ports/board-column-repository.port.js";

export type UpdateBoardColumnInput = SaveBoardColumnRequestDto &
  BoardColumnRequestDto & { actorUserId: number };

export class UpdateBoardColumnUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly columns: BoardColumnRepository,
  ) {}

  async execute(input: UpdateBoardColumnInput): Promise<void> {
    const project = await this.projects.findByIdForMember({
      id: input.id,
      userId: input.actorUserId,
    });

    if (!project) {
      throw new ProjectNotFoundError(input.id);
    }

    const column = await this.columns.findById(input);

    if (!column) {
      throw new BoardColumnNotFoundError(input.columnId);
    }

    await this.columns.update(column.withDetails(input), input.actorUserId);
  }
}
