import type { WatchQueryFetchPolicy } from "@apollo/client/core";

export const MODULE_ID = "VirtoCommerce.SalesRep";
// Boolean storefront setting shipped by the backend module (SalesRep.Enabled, default false).
export const ENABLED_KEY = "SalesRep.Enabled";
export const ROUTE_NAME = "SalesReps";
export const ROUTE_SEGMENT = "sales-reps";
export const NAV_LINK_ID = "sales-reps";
// Keeps the Sales reps link after Corporate items (mobile priority >30; desktop corporate items
// carry none, so an explicit value future-proofs ordering).
export const NAV_PRIORITY = 40;

export const MY_CUSTOMERS_ROUTE_NAME = "SalesRepMyCustomers";
export const MY_CUSTOMERS_ROUTE_SEGMENT = "my-customers";
export const MY_CUSTOMERS_NAV_LINK_ID = "sales-rep-my-customers";

// "Sales Rep hub" left-rail widget section, registered via useNavigations for reps only.
export const HUB_SECTION_ID = "sales-rep-hub";
// Low priority so the hub leads the account rail, ahead of Purchasing (10).
export const HUB_NAV_PRIORITY = 5;
// Permission that defines a Sales Rep (backend module VirtoCommerce.SalesRep, granted via a role).
export const SALES_REP_ACCESS_PERMISSION = "sales-rep:access";

// Customer profile page: /company/my-customers/:organizationId, a sibling of the My customers list
// under "Company" (the "Sales Rep hub" title comes from the left-rail section, not a URL segment).
export const CUSTOMER_PROFILE_ROUTE_NAME = "SalesRepCustomerProfile";
export const CUSTOMER_PROFILE_ROUTE_SEGMENT = `${MY_CUSTOMERS_ROUTE_SEGMENT}/:organizationId`;
// Default page size for the shared Orders widget; callers may override via the `limit` prop.
export const ORDERS_DEFAULT_LIMIT = 7;

// Sales Rep hub landing page; distinct route name from the account "Dashboard" (same label,
// different parents: /company vs /account).
export const DASHBOARD_ROUTE_NAME = "SalesRepDashboard";
export const DASHBOARD_ROUTE_SEGMENT = "dashboard";
export const DASHBOARD_NAV_LINK_ID = "sales-rep-dashboard";

// Backs the "New orders" card; order filter rules are raw order statuses, so this uses the "New"
// status (an unrecognized name fails closed — keep it aligned with a real status).
export const NEW_ORDERS_FILTER = "New";
// Cart filter-rule name for the built-in "active carts" kind — backs the "Active carts" card.
export const ACTIVE_CARTS_FILTER = "active-carts";
// Default number of ranked products shown by the Top Sellers block (backend max is 10).
export const TOP_SELLERS_DEFAULT_TAKE = 5;

// Statistics variables are day-stable by design (see buildStatisticsWindows), so under the client's
// default cache-first policy a KPI card serves its first figure until a full page reload. Revalidating
// on every mount, navigation and customer/period change is cheap — the backend caches these criteria.
export const STATISTICS_FETCH_POLICY: WatchQueryFetchPolicy = "cache-and-network";
