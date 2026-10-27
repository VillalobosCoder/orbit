import type { BoardColumnCategory } from "../../enums/board-column.enum.js";
import type { ProjectIdRequestDto } from "../projects/projects.dto.js";

export type SaveBoardColumnRequestDto = {
  name: string;
  color?: string | null;
  /** Nulo significa sin límite de trabajo en curso. */
  wipLimit?: number | null;
};

/** La categoría se elige al crear y no cambia después. */
export type CreateBoardColumnRequestDto = SaveBoardColumnRequestDto & {
  category: BoardColumnCategory;
};

export type BoardColumnRequestDto = ProjectIdRequestDto & {
  columnId: number;
};

export type ReorderBoardColumnsRequestDto = {
  /** Todas las columnas del proyecto, en el orden deseado. */
  columnIds: number[];
};

export type DeleteBoardColumnRequestDto = {
  /** Columna que recibe los issues de la que se borra. */
  moveIssuesToColumnId: number;
};
