import type {
  BoardColumnRequestDto,
  ProjectIdRequestDto,
} from "@orbit/shared";
import type { BoardColumn } from "../../../domain/board-column/board-column.entity.js";

export type ReorderColumnsCommand = ProjectIdRequestDto & {
  columnIds: number[];
  actorUserId: number;
};

export type MoveColumnIssuesCommand = ProjectIdRequestDto & {
  fromColumnId: number;
  toColumnId: number;
  /** La columna de destino tiene categoría `done`. */
  toIsDone: boolean;
  actorUserId: number;
};

export interface BoardColumnRepository {
  save(column: BoardColumn, actorUserId: number): Promise<number>;
  findAllByProject(query: ProjectIdRequestDto): Promise<BoardColumn[]>;
  findById(query: BoardColumnRequestDto): Promise<BoardColumn | null>;
  update(column: BoardColumn, actorUserId: number): Promise<void>;
  reorder(command: ReorderColumnsCommand): Promise<void>;
  /** Pasa los issues (borrados incluidos) al final de la columna de destino. */
  moveIssues(command: MoveColumnIssuesCommand): Promise<void>;
  delete(query: BoardColumnRequestDto): Promise<void>;
}
