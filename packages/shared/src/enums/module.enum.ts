export const ModuleKey = {
  HOME: "home",
  USERS: "users",
  PROJECTS: "projects",
  PROJECT_ISSUES: "projects.issues",
  PROJECT_MOVE_ISSUES: "projects.move_issues",
  PROJECT_SPRINTS: "projects.sprints",
  PROJECT_COLUMNS: "projects.columns",
} as const;
export type ModuleKey = (typeof ModuleKey)[keyof typeof ModuleKey];

export const PROJECT_SUBMODULE_KEYS: readonly ModuleKey[] = [
  ModuleKey.PROJECT_ISSUES,
  ModuleKey.PROJECT_MOVE_ISSUES,
  ModuleKey.PROJECT_SPRINTS,
  ModuleKey.PROJECT_COLUMNS,
];
