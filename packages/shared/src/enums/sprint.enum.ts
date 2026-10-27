export const SprintStatus = {
  PLANNED: "planned",
  ACTIVE: "active",
  CLOSED: "closed",
} as const;
export type SprintStatus = (typeof SprintStatus)[keyof typeof SprintStatus];
