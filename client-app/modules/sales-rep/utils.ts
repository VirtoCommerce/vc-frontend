import { ContentType, QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { ROUTES } from "@/router/routes/constants";
import type { MoneyType } from "./api/graphql/types";
import type { SalesRepDocumentType, SalesRepRuleType } from "./types";
import type { StatWidgetToneType } from "./types/widgets";
import type { ComposerTranslation } from "vue-i18n";
import type { RouteLocationRaw } from "vue-router";

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

// ISO date windows shared by the statistics ops: current bounds end at the END of the user's current day
// (see `nowIso`), previous-period windows at the same calendar position one period back (see `matched`).
//
// Day/week/month/year boundaries are the USER'S calendar, not UTC's. The widgets have to agree with the
// order lists next to them, and those render `createdDate` through `$d()` — i.e. in the browser's zone. On
// UTC boundaries an order placed at 23:00 UTC is "tomorrow" for a UTC+3 rep, so it fell outside the window
// the badge counted while still showing in the list and in the unbounded counter.
export type StatisticsWindowsType = {
  // Month-to-date and the calendar-matched slice of the previous month.
  mtdFrom: string;
  mtdTo: string;
  prevFrom: string;
  prevTo: string;
  // Year-to-date and the calendar-matched slice of the previous year.
  ytdFrom: string;
  ytdTo: string;
  lastYearFrom: string;
  lastYearTo: string;
  // Week-to-date (Monday-start) and the calendar-matched slice of the previous week.
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

// Local-time counterpart of Date.UTC: the instant at a wall-clock moment in the user's zone, with the same
// over/underflow normalization (month − 1 === −1 → prev Dec; day − n <= 0 → prev month).
const local = (year: number, month: number, day: number, hours = 0, minutes = 0, seconds = 0, ms = 0): number =>
  new Date(year, month, day, hours, minutes, seconds, ms).getTime();

// End of a day on the user's clock — the inclusive upper bound every "to" window uses.
const eod = (year: number, month: number, day: number): number => local(year, month, day, 23, 59, 59, 999);

// Every bound leaves here as a UTC instant — only *where* the user's day starts differs from UTC's.
const iso = (ms: number): string => new Date(ms).toISOString();

export function buildStatisticsWindows(now: Date = new Date()): StatisticsWindowsType {
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // The upper bound of every "to-date" window is the END of the user's current day, not the exact instant.
  // A raw `new Date()` upper bound changes every request, so the backend statistics cache (keyed on the
  // criteria, ToDate included) never hits and every figure runs live. Rounding to day granularity keeps the
  // key stable within the day so the cache engages; since there are no future-dated orders, extending "now"
  // to end-of-day never changes a count.
  const nowIso = iso(eod(year, month, day));

  const monthStart = local(year, month, 1);
  const prevMonthStart = local(year, month - 1, 1);
  const yearStart = local(year, 0, 1);
  const prevYearStart = local(year - 1, 0, 1);
  // 7 days *inclusive of today*, hence −6.
  const recentStart = local(year, month, day - 6);

  // Monday-start week: getDay() is 0 (Sun)…6 (Sat); shift so Monday === 0.
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const weekStart = local(year, month, day - daysSinceMonday);
  const prevWeekStart = local(year, month, day - daysSinceMonday - 7);

  // A baseline window ends at the same calendar position one period back (Apr 9 → Mar 9, end of day), so
  // "vs last X" compares equal spans. Calendar move rather than `prevStart + elapsed`: a DST transition in
  // either period skews an elapsed millisecond span by an hour, and at 23:59:59.999 that rolls the bound
  // onto the next day. Clamped to the current period's start so a day-of-month overflow (Mar 31 → "Feb 31",
  // which normalizes to Mar 3) can't reach into the current window and double count.
  const matched = (prevEnd: number, currentStart: number): string => iso(Math.min(prevEnd, currentStart));

  return {
    mtdFrom: iso(monthStart),
    mtdTo: nowIso,
    prevFrom: iso(prevMonthStart),
    prevTo: matched(eod(year, month - 1, day), monthStart),
    ytdFrom: iso(yearStart),
    ytdTo: nowIso,
    lastYearFrom: iso(prevYearStart),
    lastYearTo: matched(eod(year - 1, month, day), yearStart),
    weekFrom: iso(weekStart),
    weekTo: nowIso,
    prevWeekFrom: iso(prevWeekStart),
    prevWeekTo: matched(eod(year, month, day - 7), weekStart),
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

// Icon per activity category (canonical Lucide names); unknown categories get a neutral mark so a
// backend-added category renders instead of breaking the row.
const ACTIVITY_CATEGORY_ICONS: Readonly<Record<string, string>> = {
  orders: "file-text",
  customers: "user-plus",
  searches: "search",
  productViews: "eye",
  logins: "log-in",
};

export function activityCategoryIcon(category: string): string {
  return ACTIVITY_CATEGORY_ICONS[category] ?? "activity";
}

// Relative "time ago" for the compact activity rows, in the active culture. Coarse on purpose:
// analytics rows are hour-buckets, so anything finer than minutes would imply precision they lack.
const TIME_AGO_UNITS: readonly { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "week", seconds: 604800 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
];

// Intl formatters cost more to construct than to use, and these run once per rendered row — up to a
// full page of them on every tab switch. One per culture, kept for the life of the tab.
const timeAgoFormatters = new Map<string, Intl.RelativeTimeFormat>();
const hourFormatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor<T>(cache: Map<string, T>, create: (cultureName: string) => T): T {
  const cultureName = globals.cultureName;
  let formatter = cache.get(cultureName);

  if (!formatter) {
    formatter = create(cultureName);
    cache.set(cultureName, formatter);
  }

  return formatter;
}

export function formatTimeAgo(isoDate: string): string {
  const elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 1000));
  const formatter = formatterFor(
    timeAgoFormatters,
    (cultureName) => new Intl.RelativeTimeFormat(cultureName, { numeric: "auto" }),
  );

  const match = TIME_AGO_UNITS.find(({ seconds }) => elapsedSeconds >= seconds);
  if (!match) {
    // Sub-minute — "now"-style wording comes from numeric: "auto".
    return formatter.format(0, "minute");
  }

  return formatter.format(-Math.floor(elapsedSeconds / match.seconds), match.unit);
}

// Wall-clock hour label ("2:00 PM") for the honest "during the hour of …" phrasing on hour-bucket rows.
export function formatHourLabel(isoDate: string): string {
  return formatterFor(
    hourFormatters,
    (cultureName) => new Intl.DateTimeFormat(cultureName, { hour: "numeric", minute: "2-digit" }),
  ).format(new Date(isoDate));
}

// The freshest of a set of dates, absent ones skipped; undefined when none carries one. Parsed rather
// than compared as strings: the wire format is the backend's to choose, and offsets would sort wrong.
export function latestDate(dates: readonly (string | undefined)[]): string | undefined {
  let latest: string | undefined;
  let latestTime = -Infinity;

  for (const date of dates) {
    const time = date ? new Date(date).getTime() : Number.NaN;
    if (Number.isFinite(time) && time > latestTime) {
      latestTime = time;
      latest = date;
    }
  }

  return latest;
}

// The catalog search results page for a tracked term, exactly as the header search navigates (VCST-5731).
export function searchResultsRoute(term: string): RouteLocationRaw {
  return { name: ROUTES.SEARCH.NAME, query: { [QueryParamName.SearchPhrase]: term } };
}

// Document library display helpers.

// File-type badge: the extension is the most precise source (tells DOCX from DOC), so it wins over content-type.
const CONTENT_TYPE_BADGES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "application/zip": "ZIP",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "text/plain": "TXT",
  "text/csv": "CSV",
};

const FILE_EXTENSION_RE = /\.([a-z\d]+)$/i;

export function documentTypeLabel(name: string, contentType?: string | null): string {
  const extension = FILE_EXTENSION_RE.exec(name)?.[1];
  if (extension) {
    return extension.toUpperCase();
  }

  const type = contentType?.toLowerCase() ?? "";
  return CONTENT_TYPE_BADGES[type] ?? type.split("/")[1]?.toUpperCase() ?? "";
}

// Mirrors VcFile's icon mapping (ui-kit vc-file.vue); unknown types get the generic file icon.
const CONTENT_TYPE_KEYS = new Set<string>(Object.keys(ContentType));

export function documentIcon(contentType?: string | null): string {
  const known = CONTENT_TYPE_KEYS.has(contentType as ContentType) ? ContentType[contentType as ContentType] : undefined;
  return `file-${known ? known.replace("/", "-") : "file"}.svg`;
}

// "Published May 22 · 96 pages" (date only when no page count).
export function documentMeta(
  document: SalesRepDocumentType,
  t: ComposerTranslation,
  d: (value: number | Date | string, format: string) => string,
): string {
  return [
    t("sales_rep.documents.published", { date: d(document.createdDate, "short") }),
    document.pageCount
      ? t("sales_rep.documents.details.pages_count", { count: formatStatCount(document.pageCount) }, document.pageCount)
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
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
