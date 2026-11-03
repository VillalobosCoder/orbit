export const NotificationType = {
  ISSUE_DUE_SOON: "issue_due_soon",
  ISSUE_OVERDUE: "issue_overdue",
  ISSUE_ASSIGNED: "issue_assigned",
  COMMENT_ADDED: "comment_added",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const DUE_SOON_DAYS = 3;
