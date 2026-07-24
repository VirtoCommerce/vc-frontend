// View models for the customer profile (VCST-5308): a non-null, flattened shape for the UI.
export type SalesRepCustomerProfileType = {
  organizationId: string;
  organizationName: string;
  iconUrl: string;
  // Only fields the backend exposes; the design's payment terms / balances have no source yet.
  accountType: string;
  phone: string;
  shipTo: string;
  primaryContactName: string;
};
