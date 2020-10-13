import {  BvTableFieldArray } from 'bootstrap-vue';


// It is global variables initialized on the layout page
export const storeName = window.STORE_NAME;
export const currencyCode = window.CURRENCY_CODE;
export const locale = window.LOCALE;
export const currentUserId = window.USER_ID;
// Need to trim store and language from base URL because they will be added later as parameters for each API call.
export const baseUrl = window.BASE_URL.replace(`/${storeName}`, "/")
  .replace(`/${locale}`, "/")
  .replace(/[/]+$/, "");

export const fullBaseUrl = `${baseUrl}/${storeName}/${locale}/`;
export const loginUrl = `${fullBaseUrl}account/login`;
export const accessDeniedUrl = `${fullBaseUrl}error/AccessDenied`;

// General variables
export const isoDateFormat = "YYYY-MM-DD";

// Search
export const pageSizes = [10, 20, 50, 100]
export const defaultPageSize = 10;
export const startPageNumber = 1;
export const ordersStatuses = ["New","Cancelled","Processing","Completed","Pending"];
export const invoicesStatuses = ["New", "Paid"];
export const paymentsStatuses = ["Paid"];
export const orderDraftType = "orderDraft";
export const sortAscending = "asc";
export const sortDescending = "desc";
export const catalogOrderDraftsCount = 100;

// Grids
export const ordersGridFields =  window.THEME_SETTINGS.orders_grid_fields as BvTableFieldArray;
export const usersGridFields =  window.THEME_SETTINGS.users_grid_fields as BvTableFieldArray;
export const invoicesGridFields = window.THEME_SETTINGS.invoices_grid_fields as BvTableFieldArray;
export const paymentsGridFields = window.THEME_SETTINGS.payments_grid_fields as BvTableFieldArray;
export const draftsGridFields = window.THEME_SETTINGS.drafts_grid_fields as BvTableFieldArray;

// features
export const features = window.Features;
