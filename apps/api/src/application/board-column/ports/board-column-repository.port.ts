import type {
  BoardColumnRequestDto,
  ProjectIdRequestDto,
} from "@orbit/shared";
import type { BoardColumn } from "../../../domain/board-column/board-column.entity.js";
import type { Actor, ActorUserId } from "../../shared/actor.js";

export type ReorderColumnsCommand = ProjectIdRequestDto & Actor & {
  columnIds: number[];
};

export type MoveColumnIssuesCommand = ProjectIdRequestDto & Actor & {
  fromColumnId: number;
  toColumnId: number;
  /** La columna de destino tiene categoría `done`. */
  toIsDone: boolean;
};

export interface BoardColumnRepository {
  save(column: BoardColumn, actorUserId: ActorUserId): Promise<number>;
  findAllByProject(query: ProjectIdRequestDto): Promise<BoardColumn[]>;
  findById(query: BoardColumnRequestDto): Promise<BoardColumn | null>;
  update(column: BoardColumn, actorUserId: ActorUserId): Promise<void>;
  reorder(command: ReorderColumnsCommand): Promise<void>;
  /** Pasa los issues (borrados incluidos) al final de la columna de destino. */
  moveIssues(command: MoveColumnIssuesCommand): Promise<void>;
  delete(query: BoardColumnRequestDto): Promise<void>;
}
