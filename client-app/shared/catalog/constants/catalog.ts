export const CATALOG_PAGINATION_MODES = {
  loadMore: "load_more",
  infiniteScroll: "infinite_scroll",
} as const;

export enum CatalogControl {
  InStock = "inStock",
  PurchasedBefore = "purchasedBefore",
  Branches = "branches",
}
