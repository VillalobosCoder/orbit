import { BoardColumnCategory } from "@orbit/shared";

export const CATEGORY_DOT: Record<BoardColumnCategory, string> = {
  [BoardColumnCategory.TODO]: "bg-muted-foreground",
  [BoardColumnCategory.IN_PROGRESS]: "bg-primary",
  [BoardColumnCategory.DONE]: "bg-success",
};
