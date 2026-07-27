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

// Rep → publish a shopping list to one or more customer orgs (VCST-5332). storeId/cultureName are added from
// globals in the composable; the org members are notified backend-side. An empty message sends the link only.
export type SalesRepShareListInputType = {
  listId: string;
  organizationIds: string[];
  sendEmail: boolean;
  sendPush: boolean;
  message?: string;
  title?: string;
};

// Outcome of publishing a list. `sharingUrl` is the /shared-list/{key} link; `warnings` carries the same
// stable notification codes as a broadcast (see the backend's ModuleConstants.Communication.Warnings).
export type SalesRepShareListResultType = {
  succeeded: boolean;
  listId?: string;
  sharingKey?: string;
  sharingUrl?: string;
  sharedWithOrganizationIds: string[];
  warnings: string[];
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
