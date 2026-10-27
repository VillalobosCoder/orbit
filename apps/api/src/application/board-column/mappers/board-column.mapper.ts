import type { BoardColumnDto } from "@orbit/shared";
import type { BoardColumn } from "../../../domain/board-column/board-column.entity.js";

export function toBoardColumnDto(column: BoardColumn): BoardColumnDto {
  return {
    id: column.id!,
    name: column.name,
    category: column.category,
    position: column.position,
    color: column.color,
    wipLimit: column.wipLimit,
  };
}
