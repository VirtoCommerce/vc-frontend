// View models for the customer insights panels. Counts stay numbers: vue-i18n needs them to pick plural forms.

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
  isResolved: boolean;
  viewCount: number;
  lastViewedDate?: string;
};
