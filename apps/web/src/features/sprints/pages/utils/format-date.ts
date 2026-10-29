/** Las fechas de sprint son `YYYY-MM-DD`; se leen como fecha local, sin zona horaria. */
function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day);
}

function formatDay(date: Date, includeYear: boolean) {
  return date.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: includeYear ? "numeric" : undefined,
  });
}

/** "31 oct – 14 nov"; con extremos faltantes, "sin inicio" o "sin fin". */
export function formatDateRange(start: string | null, end: string | null) {
  if (!start && !end) return "Sin fechas";

  const startDate = start ? parseDate(start) : null;
  const endDate = end ? parseDate(end) : null;
  const currentYear = new Date().getFullYear();
  const includeYear =
    (startDate ?? endDate)!.getFullYear() !== currentYear ||
    (endDate ?? startDate)!.getFullYear() !== currentYear;

  return `${startDate ? formatDay(startDate, includeYear) : "sin inicio"} – ${
    endDate ? formatDay(endDate, includeYear) : "sin fin"
  }`;
}

/** Días que faltan para una fecha `YYYY-MM-DD`; negativo si ya pasó. */
export function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.round((parseDate(date).getTime() - today.getTime()) / 86_400_000);
}

/** Días naturales entre dos fechas, ambas incluidas; nulo si falta alguna. */
export function countDays(start: string | null, end: string | null) {
  if (!start || !end) return null;

  const days =
    Math.round((parseDate(end).getTime() - parseDate(start).getTime()) / 86_400_000) +
    1;

  return days > 0 ? days : null;
}
