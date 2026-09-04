// View models for the customer-insights rail widgets (VCST-5337). Counts stay numbers: they are
// interpolated into pluralized strings, so vue-i18n needs them for plural-form selection.

export type SalesRepSearchTermRowType = {
  term: string;
  count: number;
  // GA reports aggregate by hour bucket, not event timestamp — render as a date, never as a time.
  lastSearchedDate?: string;
};

export type SalesRepBrowsedProductRowType = {
  productId: string;
  name: string;
  sku: string;
  imageUrl: string;
  // True only when the backend resolved GA's product code to a real product; gates the deep link.
  // Unlike the other insights rows, productId cannot say it on its own — see the mapping.
  isResolved: boolean;
  viewCount: number;
  lastViewedDate?: string;
};
