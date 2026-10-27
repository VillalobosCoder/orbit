export const DEFAULT_ISSUE_TYPES = [
  { name: "Tarea", icon: "CheckSquare", isSubtask: false },
  { name: "Historia", icon: "BookOpen", isSubtask: false },
  { name: "Bug", icon: "Bug", isSubtask: false },
  { name: "Subtarea", icon: "ListTree", isSubtask: true },
] as const;
