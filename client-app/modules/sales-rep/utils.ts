import type { SalesRepRuleType } from "./types";
import type { StatWidgetToneType } from "./types/widgets";

// The filter chips always prepend a synthetic "All" baseline, and a backend "all" passthrough rule would
// duplicate it. So the real, selectable filter options are everything except "all" — and a filter control
// is only worth showing when at least one exists (otherwise the lone "All" chip is a no-op). Single source
// of the "all = baseline" convention, shared by the chips component and the widgets that gate the control.
export function selectableFilterRules(rules: SalesRepRuleType[]): SalesRepRuleType[] {
  return rules.filter((rule) => rule.name.toLowerCase() !== "all");
}

// The backend exposes the customer's default address as a structured object and leaves formatting to
// the storefront (schema note: e.g. "City, Region"). Keep this the single source of that format so the
// My customers list and the customer profile render locations consistently.
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
  // List rows: postal code (prefixed with "#"), city and region as three middot-separated
  // segments to match the design (e.g. "#23220 · Richmond · Virginia").
  const code = postalCode ? `#${postalCode}` : "";
  return [code, address?.city, address?.regionName].filter(Boolean).join(" · ");
}

// The statistics ops take explicit date windows as ISO strings (the backend DateTime scalar). The
// dashboard/customer widgets all share the same windows, so compute them once here. Two design rules:
//  • Current-period upper bounds are NOW (today), not the calendar-period end — so a stray future-dated
//    order can't inflate a "this month/year/week so far" figure.
//  • Previous-period windows are ELAPSED-MATCHED: prevStart → prevStart + (now − currentStart), i.e. the
//    same elapsed span a year/month/week ago, so a "vs last X" delta compares to-date against prior-to-date.
// All bounds are UTC and half-open [from, to), matching the backend convention.
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
  // Today (start of the current UTC day → now) — backs the "new orders placed today" count.
  todayFrom: string;
  todayTo: string;
};

const DAY_MS = 86_400_000;

export function buildStatisticsWindows(now: Date = new Date()): StatisticsWindowsType {
  const nowMs = now.getTime();
  const nowIso = now.toISOString();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  // Date.UTC normalizes over/underflow (month − 1 === −1 → prev Dec; day − n <= 0 → prev month).
  const monthStart = Date.UTC(year, month, 1);
  const prevMonthStart = Date.UTC(year, month - 1, 1);
  const yearStart = Date.UTC(year, 0, 1);
  const prevYearStart = Date.UTC(year - 1, 0, 1);
  const todayStart = Date.UTC(year, month, day);

  // Monday-start week: getUTCDay() is 0 (Sun)…6 (Sat); shift so Monday === 0.
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const weekStart = Date.UTC(year, month, day - daysSinceMonday);
  const prevWeekStart = weekStart - 7 * DAY_MS;

  const iso = (ms: number): string => new Date(ms).toISOString();
  // The point in a previous period matching how far the current period has elapsed — clamped to the current
  // period start so a longer current-to-date span (e.g. Mar 31 vs the shorter Feb) can't push the previous
  // window past its own end and overlap the current one, which would double-count and skew the delta.
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

// A period-over-period delta for a stat card. The backend percent is already ×100 and null when the
// baseline is zero (no meaningful ratio) — in which case there is no delta to show. Tri-state tone:
// higher than the previous period → green (up), lower → red/orange (down), unchanged → neutral (a dash).
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
