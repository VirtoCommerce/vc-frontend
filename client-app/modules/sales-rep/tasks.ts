import type { SalesRepTaskDayMarkersType, SalesRepTaskStatusType } from "./types/tasks";

/**
 * Task day maths, on the USER'S calendar rather than UTC — the same rule buildStatisticsWindows follows in
 * utils.ts, and for the same reason: the pills sit next to dates rendered through `$d()`, i.e. in the browser's
 * zone. A task due 23:00 UTC is "tomorrow" for a UTC+3 rep, so a UTC boundary would put it in a different tab
 * than the date beside it reads.
 *
 * The boundary is sent to the backend as `today` and used here to derive the pill, so the tab a task lands in and
 * the pill it renders always agree. Send one boundary to both, or they can disagree at midnight.
 */

/** Midnight at the start of the user's current day. */
export function startOfLocalDay(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** That boundary as a UTC instant — what the `today` GraphQL argument takes. */
export function startOfLocalDayIso(now: Date = new Date()): string {
  return startOfLocalDay(now).toISOString();
}

/** "YYYY-MM-DD" on the user's calendar. The key a calendar cell is addressed by; NOT `iso.slice(0, 10)`. */
export function localDayKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * The due-date window behind a month grid's dots, as UTC instants.
 *
 * Padded by a week on each side on purpose: VcCalendar renders with `fixed-weeks`, so up to six leading and
 * trailing cells belong to the ADJACENT months and still draw markers. Querying only the calendar month would
 * leave those cells blank even when they have tasks. A week of slack covers any first-day-of-week setting
 * without this module having to know the calendar's.
 */
export function localCalendarWindow(monthKey: string): { from: string; to: string } {
  const [year, month] = monthKey.split("-").map(Number);

  return {
    from: new Date(year, month - 1, 1 - 7).toISOString(),
    to: new Date(year, month, 7, 23, 59, 59, 999).toISOString(),
  };
}

/** First day of the month a "YYYY-MM-DD" falls in — the key a month grid is addressed by. */
export function toMonthKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00`) : value;

  return localDayKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

/** Inclusive local-day bounds of one "YYYY-MM-DD", as UTC instants — the window behind "tasks for this date". */
export function localDayWindow(dayKey: string): { from: string; to: string } {
  const [year, month, day] = dayKey.split("-").map(Number);

  return {
    from: new Date(year, month - 1, day).toISOString(),
    to: new Date(year, month - 1, day, 23, 59, 59, 999).toISOString(),
  };
}

/**
 * "YYYY-MM-DD" from a date picker back to the instant the API stores. Local midnight, so the day the rep picked
 * is the day localDayKey reads back and the day the calendar puts it on. A task due at exactly today's midnight
 * counts as upcoming, matching the backend's boundary.
 */
export function localDayKeyToIso(dayKey: string): string {
  const [year, month, day] = dayKey.split("-").map(Number);

  return new Date(year, month - 1, day).toISOString();
}

type TaskStateType = {
  isActive: boolean;
  completed?: boolean | null;
  dueDate?: string | null;
};

/**
 * Mirrors the backend's filter rules exactly (SalesRepTaskFilterRuleResolver): completed = finished as done,
 * canceled = closed without completing, overdue = still open and due BEFORE the start of today, upcoming =
 * everything else still open. A task due at exactly 00:00 today is upcoming, not overdue.
 *
 * A task with no due date reads as upcoming. Only the admin app can create one — the storefront's inputs make the
 * due date non-null — and the backend leaves it out of both dated tabs, so it appears under "All" alone.
 */
export function taskStatus(task: TaskStateType, dayStart: Date): SalesRepTaskStatusType {
  if (!task.isActive) {
    return task.completed === true ? "completed" : "canceled";
  }

  if (task.dueDate && new Date(task.dueDate).getTime() < dayStart.getTime()) {
    return "overdue";
  }

  return "upcoming";
}

/**
 * Which conditions each day carries, for the calendar dots. A day with ten overdue tasks yields ONE "overdue"
 * entry — a dot means "there is at least one of these here", never one dot per task.
 */
export function buildDayMarkers(
  tasks: readonly { dueDate?: string | null; status: SalesRepTaskStatusType }[],
  order: readonly SalesRepTaskStatusType[] = ["upcoming", "overdue", "completed"],
): SalesRepTaskDayMarkersType {
  const byDay = new Map<string, Set<SalesRepTaskStatusType>>();

  for (const task of tasks) {
    if (!task.dueDate) {
      continue;
    }

    const key = localDayKey(task.dueDate);
    const kinds = byDay.get(key) ?? new Set<SalesRepTaskStatusType>();
    kinds.add(task.status);
    byDay.set(key, kinds);
  }

  const result: SalesRepTaskDayMarkersType = {};
  for (const [key, kinds] of byDay) {
    // Stable order so a day's dots don't reshuffle between renders.
    result[key] = order.filter((kind) => kinds.has(kind));
  }

  return result;
}
