// View models for the customer profile page (VCST-5308). Kept in a dedicated file so the page,
// its blocks and the composables share one shape without editing the module's generated types.ts.
export type SalesRepCustomerProfileType = {
  organizationId: string;
  organizationName: string;
};

export type SalesRepCustomerOrderType = {
  id: string;
  number: string;
  createdDate: string;
  status: string;
  itemsCount: number;
  total: number;
  currency: string;
};
