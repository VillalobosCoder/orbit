import { ModuleKey } from "@orbit/shared";
import { LOCALES, translate, type MessageKey, type Translator } from "@orbit/i18n";

const MODULE_MESSAGES: Record<ModuleKey, MessageKey> = {
  [ModuleKey.HOME]: "modules.home",
  [ModuleKey.USERS]: "modules.users",
  [ModuleKey.PROJECTS]: "modules.projects",
  [ModuleKey.PROJECT_ISSUES]: "modules.projectsIssues",
  [ModuleKey.PROJECT_MOVE_ISSUES]: "modules.projectsMoveIssues",
  [ModuleKey.PROJECT_SPRINTS]: "modules.projectsSprints",
  [ModuleKey.PROJECT_COLUMNS]: "modules.projectsColumns",
};

function isModuleKey(key: string): key is ModuleKey {
  return key in MODULE_MESSAGES;
}

/** Nombre de un módulo en el idioma activo; si no se conoce, el que guarda la base de datos. */
export function moduleLabel(t: Translator, key: string, fallback: string) {
  return isModuleKey(key) ? t(MODULE_MESSAGES[key]) : fallback;
}

const PRIORITY_MESSAGES: Record<number, MessageKey> = {
  1: "catalog.priority.urgent",
  2: "catalog.priority.veryHigh",
  3: "catalog.priority.high",
  4: "catalog.priority.medium",
  5: "catalog.priority.low",
  6: "catalog.priority.veryLow",
};

const ISSUE_TYPE_MESSAGES: Record<string, MessageKey> = {
  CheckSquare: "catalog.issueType.task",
  BookOpen: "catalog.issueType.story",
  Bug: "catalog.issueType.bug",
  ListTree: "catalog.issueType.subtask",
};

const CATEGORY_MESSAGES: Record<string, MessageKey> = {
  todo: "issues.categories.todo",
  in_progress: "issues.categories.in_progress",
  done: "issues.categories.done",
};

function isDefaultName(key: MessageKey, name: string) {
  return LOCALES.some((locale) => translate(locale, key) === name);
}

/** Traduce un valor sembrado solo si conserva su nombre original; lo editado se respeta. */
function seededLabel(t: Translator, key: MessageKey | undefined, name: string) {
  return key && isDefaultName(key, name) ? t(key) : name;
}

export function priorityLabel(
  t: Translator,
  priority: { level: number; name: string },
) {
  return seededLabel(t, PRIORITY_MESSAGES[priority.level], priority.name);
}

export function issueTypeLabel(
  t: Translator,
  type: { icon: string | null; name: string },
) {
  return seededLabel(t, ISSUE_TYPE_MESSAGES[type.icon ?? ""], type.name);
}

export function columnLabel(
  t: Translator,
  column: { category: string; name: string },
) {
  return seededLabel(t, CATEGORY_MESSAGES[column.category], column.name);
}
