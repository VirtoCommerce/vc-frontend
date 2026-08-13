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
