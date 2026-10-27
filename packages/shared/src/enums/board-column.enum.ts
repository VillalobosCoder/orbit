export const BoardColumnCategory = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;
export type BoardColumnCategory =
  (typeof BoardColumnCategory)[keyof typeof BoardColumnCategory];

export const DEFAULT_BOARD_COLUMNS = [
  { name: "Por hacer", category: BoardColumnCategory.TODO, position: 0 },
  { name: "En curso", category: BoardColumnCategory.IN_PROGRESS, position: 1 },
  { name: "Finalizada", category: BoardColumnCategory.DONE, position: 2 },
] as const;
