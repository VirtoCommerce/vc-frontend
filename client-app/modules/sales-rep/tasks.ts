import { toEndDateFilterValue, toStartDateFilterValue } from "@/core/utilities";
import { eod, iso, local } from "./utils";
import type { SalesRepTaskStatusType, SalesRepTaskType, SalesRepTaskDayMarkersType } from "./types/tasks";
import type { ComposerTranslation } from "vue-i18n";

/**
 * Task day maths, on the USER'S calendar rather than UTC — the same rule buildStatisticsWindows follows in
 * utils.ts, and for the same reason: the pills sit next to dates rendered through `$d()`, i.e. in the browser's
 * zone. A task due 23:00 UTC is "tomorrow" for a UTC+3 rep, so a UTC boundary would put it in a different tab
 * than the date beside it reads.
 *
 * The boundary is sent to the backend as `today` and used here to derive the pill, so the tab a task lands in and
 * the pill it renders always agree. Send one boundary to both, or they can disagree at midnight.
 */

/**
 * The conditions a day can be marked with, in render order — one source for the calendar dots, the legend beside
 * them and the buckets `buildDayMarkers` produces, so the three cannot drift into different orders. `canceled` is
 * deliberately absent: it is not one of the tabs, and a fourth colour would say something the legend does not explain.
 */
export const TASK_MARKER_KINDS: readonly SalesRepTaskStatusType[] = ["upcoming", "overdue", "completed"];

/** Midnight at the start of the user's current day. */
export function startOfLocalDay(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** That boundary as a UTC instant — what the `today` GraphQL argument takes. */
export function startOfLocalDayIso(now: Date = new Date()): string {
  return startOfLocalDay(now).toISOString();
}

/**
 * A "YYYY-MM-DD" back as a Date for formatting. The explicit T00:00:00 is what keeps it local: a bare date-only
 * string parses as UTC, which renders as the previous day for anyone west of Greenwich.
 */
export function localDayKeyToDate(dayKey: string): Date {
  return new Date(`${dayKey}T00:00:00`);
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
 * Padded on purpose: VcCalendar renders with `fixed-weeks`, so its 42 cells always spill into the adjacent
 * months, and those cells draw markers too. The two edges are NOT symmetric - leading padding is at most 6 days
 * (the weekday index of the 1st), but trailing is `42 - leading - daysInMonth`, which reaches 14 for a 28-day
 * February starting on the first weekday. Cover the worst case, or the last grid row silently loses its dots.
 */
export function localCalendarWindow(monthKey: string): { from: string; to: string } {
  const [year, month] = monthKey.split("-").map(Number);

  return {
    from: iso(local(year, month - 1, 1 - 7)),
    to: iso(eod(year, month, 14)),
  };
}

/** First day of the month a "YYYY-MM-DD" falls in — the key a month grid is addressed by. */
export function toMonthKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00`) : value;

  return localDayKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

/** Inclusive local-day bounds of one "YYYY-MM-DD", as UTC instants — the window behind "tasks for this date". */
export function localDayWindow(dayKey: string): { from: string; to: string } {
  // Non-null: the core helpers only return undefined for an absent date, and a day key is required here.
  return { from: localDayKeyToIso(dayKey), to: toEndDateFilterValue(dayKey)! };
}

/**
 * "YYYY-MM-DD" from a date picker back to the instant the API stores. Local midnight, so the day the rep picked
 * is the day localDayKey reads back and the day the calendar puts it on. A task due at exactly today's midnight
 * counts as upcoming, matching the backend's boundary.
 */
export function localDayKeyToIso(dayKey: string): string {
  return toStartDateFilterValue(dayKey)!;
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
  order: readonly SalesRepTaskStatusType[] = TASK_MARKER_KINDS,
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

/**
 * The line under a task's title: the deadline, and only for a task that has none, its type. Shared by the table
 * and the dashboard widget so the two cannot read the same task differently. Takes the i18n functions rather than
 * calling useI18n, like `documentMeta` in utils.ts.
 *
 * A completed task keeps showing its due date rather than falling back to the type: the type is an optional
 * dictionary value, so that fallback silently left completed rows with no second line at all.
 */
export function taskSubline(
  task: SalesRepTaskType,
  t: ComposerTranslation,
  d: (value: number | Date | string, format: string) => string,
): string {
  if (!task.dueDate) {
    return task.type;
  }

  const key = task.status === "overdue" ? "expired" : "due";

  return t(`sales_rep.tasks.due_relative.${key}`, { date: d(task.dueDate, "short") });
}
