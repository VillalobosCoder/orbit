import { DUE_SOON_DAYS } from "@orbit/shared";

export type DueState = "overdue" | "soon";

const DAY_MS = 24 * 60 * 60 * 1000;

function localToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(value: string, locale: string) {
  return parseDate(value).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDueState(
  dueDate: string | null,
  isResolved: boolean,
): DueState | null {
  if (!dueDate || isResolved) return null;

  const days = Math.round(
    (parseDate(dueDate).getTime() - localToday().getTime()) / DAY_MS,
  );

  if (days < 0) return "overdue";
  return days <= DUE_SOON_DAYS ? "soon" : null;
}
