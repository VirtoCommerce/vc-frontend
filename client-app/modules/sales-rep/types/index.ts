// View model for the table; mapped from the GraphQL SalesRepContact (see useSalesReps).
// Only active reps ever reach the client — filtering is server-side (AC#5).
export type SalesRepType = { id: string; name: string; email: string; phone: string };
export type SalesRepSortColumnType = "name" | "email" | "phone";
export type SalesRepSortType = { column: SalesRepSortColumnType; direction: "asc" | "desc" };

// View model for the My Customers table; mapped from the GraphQL SalesRepCustomer (see
// useSalesRepCustomers). `lastOrder` is absent when the organization has no orders yet.
export type SalesRepCustomerLastOrderType = { id: string; number: string; createdDate: string };
export type SalesRepCustomerType = {
  organizationId: string;
  organizationName: string;
  lastOrder?: SalesRepCustomerLastOrderType;
};
// Only Name is sortable — server-side sort of salesRepCustomers is name-backed (same limit as
// the Sales reps table).
export type SalesRepCustomerSortColumnType = "name";
export type SalesRepCustomerSortType = { column: SalesRepCustomerSortColumnType; direction: "asc" | "desc" };
