// View model for the table; mapped from the GraphQL SalesRepContact (see useSalesReps).
// Only active reps ever reach the client — filtering is server-side (AC#5).
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
  ytdCount: number;
  lastYearTotal: string;
  lastOrder?: SalesRepCustomerLastOrderType;
};

// A server-defined filter/sort rule option surfaced as a chip or dropdown entry; the chosen `name` is
// sent back in the unified filter/sort argument. `label` is the resolved display text — frontend i18n
// (keyed by `name`) → backend localizedName → raw name (see useSalesRepRules).
export type SalesRepRuleType = { name: string; label: string };
export type SalesRepRuleDomainType = "order" | "cart" | "customer" | "topSeller";
export type SalesRepRuleKindType = "filter" | "sort";

// View model for a ranked Top Sellers row; `revenue` is the backend-formatted amount.
export type SalesRepTopSellerRowType = {
  rank: number;
  productId: string;
  name: string;
  sku: string;
  imageUrl: string;
  units: number;
  revenue: string;
};

// View model for a Sales Rep order row, shared by the customer profile (single org) and the hub
// dashboard (cross-customer). `organizationName` backs the dashboard's Customer column;
// `statusDisplayValue` is the localized status label; `total` is the backend-formatted amount.
export type SalesRepOrderRowType = {
  id: string;
  number: string;
  organizationId: string;
  organizationName: string;
  createdDate: string;
  status: string;
  statusDisplayValue: string;
  itemsCount: number;
  total: string;
};
