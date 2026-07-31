import type { SalesRepRuleType } from "./types";
import type { StatWidgetToneType } from "./types/widgets";

// Selectable filter options exclude the backend "all" rule (chips already prepend a synthetic "All" baseline).
export function selectableFilterRules(rules: SalesRepRuleType[]): SalesRepRuleType[] {
  return rules.filter((rule) => rule.name.toLowerCase() !== "all");
}

// Backend leaves address formatting to the storefront; single source of that format so both surfaces
// render locations consistently.
type LocationPartsType =
  | { postalCode?: string | null; zip?: string | null; city?: string | null; regionName?: string | null }
  | null
  | undefined;

export function formatCustomerLocation(address: LocationPartsType, options?: { withPostalCode?: boolean }): string {
  if (!options?.withPostalCode) {
    // Profile "ship to": "City, Region".
    return [address?.city, address?.regionName].filter(Boolean).join(", ");
  }

  // `postalCode` is the canonical member-address field; `zip` is a legacy alias kept as a fallback.
  const postalCode = address?.postalCode || address?.zip;
  // List rows: postal code (prefixed "#"), city, region — middot-separated (e.g. "#23220 · Richmond · Virginia").
  const code = postalCode ? `#${postalCode}` : "";
  return [code, address?.city, address?.regionName].filter(Boolean).join(" · ");
}

// ISO date windows shared by the statistics ops: current bounds end at NOW (not calendar end);
// previous-period windows are elapsed-matched for a fair "vs last X" delta.
//
// Day/week/month/year boundaries are the USER'S calendar, not UTC's. The widgets have to agree with the
// order lists next to them, and those render `createdDate` through `$d()` — i.e. in the browser's zone. On
// UTC boundaries an order placed at 23:00 UTC is "tomorrow" for a UTC+3 rep, so it fell outside the
// "created today" badge while still showing in the list and in the unbounded counter.
export type StatisticsWindowsType = {
  // Month-to-date and the elapsed-matched slice of the previous month.
  mtdFrom: string;
  mtdTo: string;
  prevFrom: string;
  prevTo: string;
  // Year-to-date and the elapsed-matched slice of the previous year.
  ytdFrom: string;
  ytdTo: string;
  lastYearFrom: string;
  lastYearTo: string;
  // Week-to-date (Monday-start) and the elapsed-matched slice of the previous week.
  weekFrom: string;
  weekTo: string;
  prevWeekFrom: string;
  prevWeekTo: string;
  // Today (start of the user's current day → now) — backs the "new orders placed today" count.
  todayFrom: string;
  todayTo: string;
};

// Local-time counterpart of Date.UTC: the instant at a wall-clock moment in the user's zone, with the same
// over/underflow normalization (month − 1 === −1 → prev Dec; day − n <= 0 → prev month).
const local = (year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0, ms = 0): number =>
  new Date(year, month, day, hours, minutes, seconds, ms).getTime();

// Every bound leaves here as a UTC instant — only *where* the user's day starts differs from UTC's.
const iso = (ms: number): string => new Date(ms).toISOString();

export function buildStatisticsWindows(now: Date = new Date()): StatisticsWindowsType {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // The upper bound of every "to-date" window (and the elapsed span the previous-period baselines are
  // matched to) is the END of the user's current day, not the exact instant. A raw `new Date()` upper bound
  // changes every request, so the backend statistics cache (keyed on the criteria, ToDate included) never
  // hits and every figure runs live. Rounding to day granularity keeps the key stable within the day so
  // the cache engages; since there are no future-dated orders, extending "now" to end-of-day never changes
  // a count.
  const nowMs = local(year, month, day, 23, 59, 59, 999);
  const nowIso = iso(nowMs);

  const monthStart = local(year, month, 1);
  const prevMonthStart = local(year, month - 1, 1);
  const yearStart = local(year, 0, 1);
  const prevYearStart = local(year - 1, 0, 1);
  const todayStart = local(year, month, day);

  // Monday-start week: getDay() is 0 (Sun)…6 (Sat); shift so Monday === 0.
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const weekStart = local(year, month, day - daysSinceMonday);
  // Calendar arithmetic rather than weekStart − 7×24h: a DST transition inside the week makes the elapsed
  // millisecond span differ from seven days, which would land the bound an hour off midnight.
  const prevWeekStart = local(year, month, day - daysSinceMonday - 7);

  // Clamped to the previous period's own end, so a longer current elapsed span (e.g. 30 days into
  // March vs a 28-day Feb) can't spill past it and double count.
  const matched = (prevStart: number, currentStart: number): string =>
    iso(Math.min(prevStart + (nowMs - currentStart), currentStart));

  return {
    mtdFrom: iso(monthStart),
    mtdTo: nowIso,
    prevFrom: iso(prevMonthStart),
    prevTo: matched(prevMonthStart, monthStart),
    ytdFrom: iso(yearStart),
    ytdTo: nowIso,
    lastYearFrom: iso(prevYearStart),
    lastYearTo: matched(prevYearStart, yearStart),
    weekFrom: iso(weekStart),
    weekTo: nowIso,
    prevWeekFrom: iso(prevWeekStart),
    prevWeekTo: matched(prevWeekStart, weekStart),
    todayFrom: iso(todayStart),
    todayTo: nowIso,
  };
}

// A KPI count for a stat card — an em dash placeholder while the source is still loading / absent.
export function formatStatCount(value?: number | null): string {
  return value != null ? String(value) : "—";
}

// Backend percent is already ×100 and null when the baseline is zero (no delta then); tri-state
// tone: up = green, down = red/orange, unchanged = neutral.
export type SignedPercentType = { text: string; tone: StatWidgetToneType; icon: string };

// eslint-disable-next-line sonarjs/function-return-type -- the signed delta or undefined (no baseline) by design
export function formatSignedPercent(percent?: number | null): SignedPercentType | undefined {
  if (percent == null) {
    return undefined;
  }

  const rounded = Math.round(percent);
  if (rounded > 0) {
    return { text: `+${rounded}%`, tone: "positive", icon: "chevron-up" };
  }
  if (rounded < 0) {
    return { text: `${rounded}%`, tone: "negative", icon: "chevron-down" };
  }
  return { text: "0%", tone: "neutral", icon: "minus" };
}
