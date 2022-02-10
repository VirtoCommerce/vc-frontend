// @ts-nocheck
// It is global variables initialized on the layout page
//TODO: rework to use one object with propwrites
export const storeName = window.STORE_NAME || "B2B-store";
export const storeId = window.STORE_ID || "B2B-store";
export const currencyCode = window.CURRENCY_CODE || "USD";
export const storeLanguages = window.STORE_LANGUAGES || "";
export const locale = window.LOCALE || "";
export let currentUserId = window.USER_ID || "";
export let catalogId = window.CATALOG_ID || "";
export const categoryId = window.CATEGORY_ID || "";
export const productId = window.PRODUCT_ID || "";

export function setUserId(id: string): void {
  currentUserId = id;
}

export function setCatalogId(id: string): void {
  catalogId = id;
}

//TODO: load from  storefront API
export const mainMenu = window.MAIN_MENU;
export const locales = window.LOCALES;

// Need to trim store and language from base URL because they will be added later as parameters for each API call.
export const baseUrl = window.BASE_URL?.replace(`/${storeName}`, "/").replace(`/${locale}`, "/").replace(/[/]+$/, "");

export const fullBaseUrl = `${baseUrl}/${storeName}/${locale}/`;
export const loginUrl = `${fullBaseUrl}account/login`;
export const accessDeniedUrl = `${fullBaseUrl}error/AccessDenied`;

// General variables
export const isoDateFormat = "YYYY-MM-DD";

// Search
export const pageSizes = [16, 32, 48];
export const defaultPageSize = 16;
export const startPageNumber = 1;
export const ordersStatuses = ["New", "Cancelled", "Processing", "Completed", "Pending"];
export const invoicesStatuses = ["New", "Paid"];
export const paymentsStatuses = ["Paid"];
export const orderDraftType = "orderDraft";
export const sortAscending = "asc";
export const sortDescending = "desc";
export const catalogOrderDraftsCount = 100;
