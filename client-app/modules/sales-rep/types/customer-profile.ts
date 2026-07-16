// View models for the customer profile (VCST-5308): a non-null, flattened shape for the UI.
export type SalesRepCustomerProfileType = {
  organizationId: string;
  organizationName: string;
  // Only fields the backend exposes; the design's payment terms / balances have no source yet.
  accountType: string;
  phone: string;
  shipTo: string;
  primaryContactName: string;
};

export type SalesRepCustomerOrderType = {
  id: string;
  number: string;
  createdDate: string;
  status: string;
  itemsCount: number;
  total: string;
};
