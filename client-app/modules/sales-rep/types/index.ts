// View model for the table; mapped from the GraphQL SalesRepContact (see useSalesReps).
// Only active reps ever reach the client; filtering is server-side.
export type SalesRepType = { id: string; name: string; email: string; phone: string };
export type SalesRepSortColumnType = "name" | "email" | "phone";
export type SalesRepSortType = { column: SalesRepSortColumnType; direction: "asc" | "desc" };

// View model for the My Customers table; `lastOrder` is absent when the org has no orders yet.
export type SalesRepCustomerLastOrderType = { id: string; number: string; createdDate: string };
export type SalesRepCustomerType = {
  organizationId: string;
  organizationName: string;
  // Business category (Member.accountType), e.g. "Garden Center"; empty when unset.
  accountType: string;
  // Default ship-to location, pre-formatted as "#postalCode · City · Region"; empty when no address.
  location: string;
  // Inline per-row purchase columns (aliased orderStatistics slices; the backend batches, no N+1).
  ytdTotal: string;
  // Stays a number: it is interpolated into a sentence, so vue-i18n needs it for plural selection.
  ytdCount: number;
  lastYearTotal: string;
  lastOrder?: SalesRepCustomerLastOrderType;
};

export type SalesRepSortDirectionType = "asc" | "desc";

// A server-defined filter/sort rule option surfaced as a chip or dropdown entry (see useSalesRepRules).
// `defaultDirection`/`supportsDirection` are present on SORT rules only (absent on filter rules).
export type SalesRepRuleType = {
  name: string;
  label: string;
  // Item count shown as a highlighted counter next to the label (document-category tabs only).
  count?: number;
  defaultDirection?: SalesRepSortDirectionType;
  supportsDirection?: boolean;
};
export type SalesRepRuleDomainType = "order" | "customer" | "topSeller";
export type SalesRepRuleKindType = "filter" | "sort";

// View model for a ranked Top Sellers row. `units`/`revenue` are display-ready strings from the shared
// stat formatters, so this table's figures group the same way as the KPI cards above it (VCST-5586).
export type SalesRepTopSellerRowType = {
  rank: number;
  productId: string;
  name: string;
  sku: string;
  imageUrl: string;
  units: string;
  revenue: string;
};

// Rep → customer-org broadcast (VCST-5310). storeId/cultureName are added from globals in the composable,
// not entered by the user; recipients (all org members) are resolved backend-side.
export type SalesRepCommunicationInputType = {
  organizationId: string;
  sendEmail: boolean;
  sendPush: boolean;
  message: string;
  title?: string;
};

// Per-channel outcome of a broadcast. `warnings` carries stable codes (see the backend's
// ModuleConstants.Communication.Warnings) that the UI maps to a localized message.
export type SalesRepCommunicationResultType = {
  succeeded: boolean;
  pushSent: boolean;
  emailSent: boolean;
  warnings: string[];
};

// One activity feed row (VCST-5337). Flat + discriminators, mirroring the wire shape: `category`
// groups for tabs/icons, `type` picks the wording, and the optional payload depends on the type.
export type SalesRepActivityItemType = {
  category: string;
  type: string;
  // UTC instant; for `precision: "hour"` rows it is the hour-bucket start, never an exact moment.
  occurredAt: string;
  precision: "exact" | "hour";
  // Occurrences this row aggregates (1 for exact rows; the bucket size for analytics hour rows).
  count: number;
  organizationId: string;
  organizationName: string;
  orderId: string;
  orderNumber: string;
  status: string;
  statusDisplayValue: string;
  orderTotal: string;
  searchTerm: string;
  productId: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productImageUrl: string;
};

export type SalesRepActivityCategoryCountType = { category: string; count: number };

// Per-customer activity summary (VCST-5337). GA-sourced fields are null/0 with
// `isAnalyticsConfigured: false` when analytics is absent; `createdOn` still comes from the DB.
export type SalesRepActivityProductType = {
  code: string;
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
};
export type SalesRepCustomerActivitySummaryType = {
  createdOn?: string;
  lastWebLogin?: string;
  visitsCount: number;
  lastSearchTerm: string;
  lastViewedProduct?: SalesRepActivityProductType;
  isAnalyticsConfigured: boolean;
};

// View model for a shared library document (VCST-5730); mapped from the GraphQL SalesRepDocument.
// `url` is the AUTHORIZED download endpoint (/api/sales-rep/documents/{id}) — the only URL the UI may
// open or download; raw asset URLs are never constructed client-side. `previewUrl` is the only image
// source usable in an <img> (the download endpoint needs auth headers a plain <img> cannot send).
export type SalesRepDocumentType = {
  id: string;
  // Raw file name — what downloadFile saves the file as; every visible name renders displayName.
  name: string;
  // Human-facing name; falls back to the raw file name on a blank wire value.
  displayName: string;
  // Subfolder name under the library root (e.g. "Catalogs"); empty when the file sits at the root.
  category: string;
  // The library's single highlighted document — featured by default and badged "Latest release".
  isPinned: boolean;
  contentType: string;
  size: number;
  createdDate: string;
  // Falls back to createdDate on the wire's null so "Updated …" always has a date to show.
  modifiedDate: string;
  url: string;
  summary: string;
  pageCount?: number;
  previewUrl: string;
};

// A category tab on the browse-all page: subfolder name + document count.
export type SalesRepDocumentCategoryType = { name: string; count: number };

// Sales Rep order row, shared by the customer profile and hub dashboard; organizationName backs
// the dashboard's Customer column.
export type SalesRepOrderRowType = {
  id: string;
  number: string;
  organizationId: string;
  organizationName: string;
  createdDate: string;
  status: string;
  statusDisplayValue: string;
  itemsCount: string;
  total: string;
};
