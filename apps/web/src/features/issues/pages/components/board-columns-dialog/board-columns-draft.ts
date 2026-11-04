import {
  BoardColumnCategory,
  type BoardColumnDto,
} from "@orbit/shared";

export type DraftColumn = {
  key: string;
  id: number | null;
  name: string;
  color: string | null;
  category: BoardColumnCategory;
  wipLimit: number | null;
};

export type Deletion = { id: number; moveToId: number };

export function toDraft(column: BoardColumnDto): DraftColumn {
  return {
    key: `column-${column.id}`,
    id: column.id,
    name: column.name,
    color: column.color,
    category: column.category,
    wipLimit: column.wipLimit,
  };
}

export function sortColumns(columns: BoardColumnDto[]) {
  return [...columns].sort((a, b) => a.position - b.position || a.id - b.id);
}

export function normalizeName(name: string) {
  return name.trim().toLowerCase();
}
