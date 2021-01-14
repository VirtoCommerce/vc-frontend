// It is global variables initialized on the layout page
//TODO: rework to use one object with propwrites
export const storeName = window.STORE_NAME;
export const storeId = window.STORE_ID;
export const currencyCode = window.CURRENCY_CODE;
export const locale = window.LOCALE;
export const currentUserId = window.USER_ID;
export const catalogId = window.CATALOG_ID;
export const categoryId = window.CATEGORY_ID;
export const productId = window.PRODUCT_ID;

//TODO: load from  storefront API
export const mainMenu = window.MAIN_MENU;
export const locales = window.LOCALES;

// Need to trim store and language from base URL because they will be added later as parameters for each API call.
export const baseUrl = window.BASE_URL
  .replace(`/${storeName}`, "/")
  .replace(`/${locale}`, "/")
  .replace(/[/]+$/, "");

export const fullBaseUrl = `${baseUrl}/${storeName}/${locale}/`;
export const loginUrl = `${fullBaseUrl}account/login`;
export const accessDeniedUrl = `${fullBaseUrl}error/AccessDenied`;

// General variables
export const isoDateFormat = "YYYY-MM-DD";

// Search
export const pageSizes = [10, 20, 50, 100];
export const defaultPageSize = 10;
export const startPageNumber = 1;
export const ordersStatuses = ["New", "Cancelled", "Processing", "Completed", "Pending"];
export const invoicesStatuses = ["New", "Paid"];
export const paymentsStatuses = ["Paid"];
export const orderDraftType = "orderDraft";
export const sortAscending = "asc";
export const sortDescending = "desc";
export const catalogOrderDraftsCount = 100;


