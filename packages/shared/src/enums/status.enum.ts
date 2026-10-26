export const StatusTypeKey = {
  USER: "USER",
  PROJECT: "PROJECT",
  ISSUE: "ISSUE",
} as const;
export type StatusTypeKey =
  (typeof StatusTypeKey)[keyof typeof StatusTypeKey];

export const UserStatusKey = {
  ACTIVE: "USER_ACTIVE",
  PENDING: "USER_PENDING",
  SUSPENDED: "USER_SUSPENDED",
  DELETED: "USER_DELETED",
} as const;
export type UserStatusKey =
  (typeof UserStatusKey)[keyof typeof UserStatusKey];

export const ProjectStatusKey = {
  ACTIVE: "PROJECT_ACTIVE",
  ARCHIVED: "PROJECT_ARCHIVED",
  DELETED: "PROJECT_DELETED",
} as const;
export type ProjectStatusKey =
  (typeof ProjectStatusKey)[keyof typeof ProjectStatusKey];

export const IssueStatusKey = {
  ACTIVE: "ISSUE_ACTIVE",
  DELETED: "ISSUE_DELETED",
} as const;
export type IssueStatusKey =
  (typeof IssueStatusKey)[keyof typeof IssueStatusKey];
