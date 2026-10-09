import { ContentType, QueryParamName } from "@/core/enums";
import { globals } from "@/core/globals";
import { ROUTES } from "@/router/routes/constants";
import { formatStatCount, formatStatMoney } from "@/shared/dashboard";
import { BUYER_ORDER_ROUTE_NAME, CUSTOMER_ORDER_ROUTE_NAME } from "./constants";
import type { MoneyType, SalesRepCustomerOrdersQuery, SalesRepOrdersQuery } from "./api/graphql/types";
import type {
  SalesRepCustomerOrderRowType,
  SalesRepDocumentType,
  SalesRepOrderRowType,
  SalesRepFacetOptionType,
  SalesRepRuleType,
} from "./types";
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
