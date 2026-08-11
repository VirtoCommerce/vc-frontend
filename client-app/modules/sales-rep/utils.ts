import { globals } from "@/core/globals";
import type { MoneyType } from "./api/graphql/types";
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
  // Rolling 7 days — bounds the `new_orders` card. Rolling rather than week-to-date, because a
  // Monday-start window reads ~0 first thing Monday, when the actionable backlog is at its largest.
  // The locale strings spell the span out ("of {count} created in the last 7 days"), so changing it
  // means retranslating them.
  recentFrom: string;
  recentTo: string;
};

export function buildStatisticsWindows(now: Date = new Date()): StatisticsWindowsType {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  // The upper bound of every "to-date" window (and the elapsed span the previous-period baselines are
  // matched to) is the END of the current UTC day, not the exact instant. A raw `new Date()` upper bound
  // changes every request, so the backend statistics cache (keyed on the criteria, ToDate included) never
  // hits and every figure runs live. Rounding to day granularity keeps the key stable within the day so
  // the cache engages; since there are no future-dated orders, extending "now" to end-of-day never changes
  // a count.
  const nowMs = Date.UTC(year, month, day, 23, 59, 59, 999);
  const nowIso = new Date(nowMs).toISOString();

  // Date.UTC normalizes over/underflow (month − 1 === −1 → prev Dec; day − n <= 0 → prev month).
  const monthStart = Date.UTC(year, month, 1);
  const prevMonthStart = Date.UTC(year, month - 1, 1);
  const yearStart = Date.UTC(year, 0, 1);
  const prevYearStart = Date.UTC(year - 1, 0, 1);
  // 7 days *inclusive of today*, hence −6.
  const recentStart = Date.UTC(year, month, day - 6);

  // Monday-start week: getUTCDay() is 0 (Sun)…6 (Sat); shift so Monday === 0.
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const weekStart = Date.UTC(year, month, day - daysSinceMonday);
  const prevWeekStart = Date.UTC(year, month, day - daysSinceMonday - 7);

  const iso = (ms: number): string => new Date(ms).toISOString();
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
    recentFrom: iso(recentStart),
    recentTo: nowIso,
  };
}

// The one formatting seam for every stat figure (VCST-5586): an absent metric reads as 0, never as a
// blank or a dash. Loading and error aren't values, so <StatWidget> owns those, not this.
// Fallbacks format in globals' culture/currency. The statistics queries send that same currencyCode,
// so their fallbacks match; the customers/orders queries send none, so a fallback there assumes the
// backend converted to the same currency.
const EMPTY_STAT_VALUE = "0";

export function formatStatCount(value?: number | null): string {
  return new Intl.NumberFormat(globals.cultureName).format(value ?? 0);
}

// Client-side currency formatting follows <VcTotalDisplay>, so an absent amount reads as a currency
// zero rather than a bare one — except before globals are bootstrapped, when there is no currency to
// format with and a plain 0 is the honest answer.
export function formatStatMoney(money?: Pick<MoneyType, "formattedAmount"> | null): string {
  // Checks the string, not just the object: an empty formattedAmount is legal on the wire and would
  // otherwise render the exact blank this fix removes.
  if (money?.formattedAmount) {
    return money.formattedAmount;
  }

  // Intl rejects style:"currency" without a currency.
  const currency: string | undefined = globals.currencyCode;
  if (!currency) {
    return EMPTY_STAT_VALUE;
  }

  return new Intl.NumberFormat(globals.cultureName, { style: "currency", currency }).format(0);
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
