import type {
  BoardColumnRequestDto,
  SaveBoardColumnRequestDto,
} from "@orbit/shared";
import { BoardColumnNotFoundError } from "../../../domain/board-column/board-column.errors.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import type { BoardColumnRepository } from "../ports/board-column-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type UpdateBoardColumnInput = SaveBoardColumnRequestDto &
  BoardColumnRequestDto & Actor;

export class UpdateBoardColumnUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly columns: BoardColumnRepository,
  ) {}

  async execute(input: UpdateBoardColumnInput): Promise<void> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const column = await this.columns.findById(input);

    if (!column) {
      throw new BoardColumnNotFoundError(input.columnId);
    }

    await this.columns.update(column.withDetails(input), input.actorUserId);
  }
}
