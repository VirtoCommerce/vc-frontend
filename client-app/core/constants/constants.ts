export const DEVELOPMENT = import.meta.env.MODE === "development";

export const DEFAULT_PAGE_SIZE = 16;
export const DEFAULT_SEARCH_PAGE_SIZE = 20;
export const SORT_ASCENDING = "asc";
export const SORT_DESCENDING = "desc";
export const DEFAULT_WISHLIST_LIMIT = 10;
export const DEFAULT_NOTIFICATION_DURATION = 15000;

export const PRODUCT_SORTING_LIST = [
  { id: "", name: "Featured" },
  { id: "name-ascending", name: "Alphabetically, A-Z" },
  { id: "name-descending", name: "Alphabetically, Z-A" },
  { id: "price-ascending", name: "Price, low to high" },
  { id: "price-descending", name: "Price, high to low" },
  { id: "createddate-descending", name: "Date, new to old" },
  { id: "createddate-ascending", name: "Date, old to new" },
];

export enum XapiContactStatus {
  New = "New",
  Approved = "Approved",
  Rejected = "Rejected",
}
