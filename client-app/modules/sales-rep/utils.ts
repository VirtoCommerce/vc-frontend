import { ContentType } from "@/core/enums";
import { globals } from "@/core/globals";
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
