import type {
  BoardColumnDto,
  CreateBoardColumnRequestDto,
  ProjectIdRequestDto,
} from "@orbit/shared";
import { BoardColumn } from "../../../domain/board-column/board-column.entity.js";
import type { ProjectRepository } from "../../project/ports/project-repository.port.js";
import { toBoardColumnDto } from "../mappers/board-column.mapper.js";
import type { BoardColumnRepository } from "../ports/board-column-repository.port.js";
import type { Actor } from "../../shared/actor.js";
import { requireProjectMember } from "../../project/utils/require-project-member.js";

export type CreateBoardColumnInput = CreateBoardColumnRequestDto &
  ProjectIdRequestDto & Actor;

export class CreateBoardColumnUseCase {
  constructor(
    private readonly projects: ProjectRepository,
    private readonly columns: BoardColumnRepository,
  ) {}

  async execute(input: CreateBoardColumnInput): Promise<BoardColumnDto> {
    await requireProjectMember(this.projects, input.id, input.actorUserId);

    const existing = await this.columns.findAllByProject({ id: input.id });
    const lastPosition = Math.max(-1, ...existing.map((item) => item.position));
    const column = BoardColumn.register({
      ...input,
      projectId: input.id,
      position: lastPosition + 1,
    });
    const columnId = await this.columns.save(column, input.actorUserId);

    return toBoardColumnDto(
      BoardColumn.fromPersistence({ ...column.toPrimitives(), id: columnId }),
    );
  }
}
