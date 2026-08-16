export type ActivityBand = "all" | "active" | "low" | "none";

export function parseReportDate(value: string | undefined, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`,
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function normalizePage(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? Math.min(page, 10_000) : 1;
}

export function completionPercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
}

export function classifyActivity(
  lastActivity: Date | null,
  now = new Date(),
): Exclude<ActivityBand, "all"> {
  if (!lastActivity) return "none";
  const days = (now.getTime() - lastActivity.getTime()) / 86_400_000;
  return days > 14 ? "none" : days > 7 ? "low" : "active";
}

export function inActivityBand(
  lastActivity: Date | null,
  band: ActivityBand,
  now = new Date(),
) {
  return band === "all" || classifyActivity(lastActivity, now) === band;
}

export function latestDate(dates: Array<Date | null | undefined>) {
  const valid = dates.filter((date): date is Date => Boolean(date));
  return valid.length
    ? new Date(Math.max(...valid.map((date) => date.getTime())))
    : null;
}
