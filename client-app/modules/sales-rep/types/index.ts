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
  // Default ship-to location, pre-formatted as "#postalCode · City · Region"; empty when no address.
  location: string;
  lastOrder?: SalesRepCustomerLastOrderType;
};
// Only Name is sortable — the server sort is name-backed.
export type SalesRepCustomerSortColumnType = "name";
export type SalesRepCustomerSortType = { column: SalesRepCustomerSortColumnType; direction: "asc" | "desc" };
