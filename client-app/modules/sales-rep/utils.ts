import { globals } from "@/core/globals";
import { BUYER_ORDER_ROUTE_NAME, CUSTOMER_ORDER_ROUTE_NAME } from "./constants";
import type { MoneyType, SalesRepCustomerOrdersQuery, SalesRepOrdersQuery } from "./api/graphql/types";
import type {
  SalesRepCustomerOrderRowType,
  SalesRepOrderRowType,
  SalesRepFacetOptionType,
  SalesRepRuleType,
} from "./types";
import type { StatWidgetToneType } from "./types/widgets";
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
  // Rolling 7 days of the user's calendar — bounds the `new_orders` card. Rolling rather than
  // week-to-date, because a Monday-start window reads ~0 first thing Monday, when the actionable
  // backlog is at its largest. The locale strings spell the span out ("of {count} created in the
  // last 7 days"), so changing it means retranslating them.
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

// Connection items → table rows, shared by the orders widget and the customer orders page.
type OrderNodeType = NonNullable<NonNullable<SalesRepOrdersQuery["salesRepOrders"]>["items"]>[number];

type OrderRowSourceType = {
  id: string;
  number?: string;
  organizationId?: string;
  organizationName?: string;
  createdDate: string;
  status?: string;
  statusDisplayValue?: string;
  total?: Pick<MoneyType, "formattedAmount"> | null;
};

function toOrderRowBase(order: OrderRowSourceType) {
  return {
    id: order.id,
    number: order.number ?? "",
    organizationId: order.organizationId ?? "",
    organizationName: order.organizationName ?? "",
    createdDate: order.createdDate,
    status: order.status ?? "",
    statusDisplayValue: order.statusDisplayValue ?? "",
    total: formatStatMoney(order.total),
  };
}

function presentOrders<T>(items?: (T | null)[]): NonNullable<T>[] {
  return (items ?? []).filter((order): order is NonNullable<T> => order != null);
}

export function toSalesRepOrderRows(items?: OrderNodeType[]): SalesRepOrderRowType[] {
  return presentOrders(items).map((order) => ({
    ...toOrderRowBase(order),
    itemsCount: formatStatCount(order.itemsCount),
  }));
}

type CustomerOrderNodeType = NonNullable<
  NonNullable<SalesRepCustomerOrdersQuery["salesRepCustomerOrders"]>["items"]
>[number];

export function toSalesRepCustomerOrderRows(items?: CustomerOrderNodeType[]): SalesRepCustomerOrderRowType[] {
  return presentOrders(items).map((order) => ({
    ...toOrderRowBase(order),
    // A rep-placed order records the rep as its customer — the field the backend scopes own-orders by.
    isOwn: Boolean(globals.userId) && order.customerId === globals.userId,
  }));
}

export function toFacetOptions(
  facets: NonNullable<SalesRepCustomerOrdersQuery["salesRepCustomerOrders"]>["term_facets"] | undefined,
  facetName: string,
): SalesRepFacetOptionType[] {
  return (facets ?? [])
    .filter((facet) => facet?.name === facetName)
    .flatMap((facet) => facet.terms ?? [])
    .filter((term) => term != null)
    .map((term) => ({ name: term.term, label: term.label || term.term, count: term.count }));
}

// An order the rep placed opens on the buyer-facing page, where they can still act on it; everyone else's
// opens read-only in the hub.
export function salesRepOrderRoute(order: SalesRepCustomerOrderRowType, organizationId?: string): RouteLocationRaw {
  if (order.isOwn) {
    return { name: BUYER_ORDER_ROUTE_NAME, params: { orderId: order.id } };
  }

  return {
    name: CUSTOMER_ORDER_ROUTE_NAME,
    params: { organizationId: organizationId ?? order.organizationId, orderId: order.id },
  };
}
