// @ts-nocheck
// It is global variables initialized on the layout page
//TODO: rework to use one object with propwrites
export const storeId = window.STORE_ID || "B2B-store";
export let currencyCode = window.CURRENCY_CODE || "USD";
export let locale = window.LOCALE || "en-US";
export let currentUserId = window.USER_ID || "";
export let catalogId = window.CATALOG_ID || "";
export const isDevelopment = import.meta.env.MODE === "development";

export function setUserId(id: string): void {
  currentUserId = id;
}

export function setCatalogId(id: string): void {
  catalogId = id;
}

export function setLocale(id: string): void {
  locale = id;
}

export function setCurrencyCode(code: string): void {
  currencyCode = code;
}

//CSS
export const overflowHiddenClass = "overflow-hidden";

// Search
export const defaultPageSize = 16;
export const defaultSearchPageSize = 20;
export const sortAscending = "asc";
export const sortDescending = "desc";
export const inStockFilterExpression = "instock_quantity:(1 TO)";

export const productSortingList = [
  { id: "priority-descending;name-ascending", name: "Featured" },
  { id: "name-ascending", name: "Alphabetically, A-Z" },
  { id: "name-descending", name: "Alphabetically, Z-A" },
  { id: "price-ascending", name: "Price, low to high" },
  { id: "price-descending", name: "Price, high to low" },
  { id: "createddate-descending", name: "Date, new to old" },
  { id: "createddate-ascending", name: "Date, old to new" },
];
