export const MODULE_ID = "VirtoCommerce.SalesRep";
// Boolean storefront setting shipped by the backend module (VirtoCommerce.SalesRep,
// ModuleConstants.Settings.General.SalesRepEnabled, default false).
export const ENABLED_KEY = "SalesRep.Enabled";
export const ROUTE_NAME = "SalesReps";
export const ROUTE_SEGMENT = "sales-reps";
export const NAV_LINK_ID = "sales-reps";
// Sorts the Sales reps link after the existing Corporate items on both desktop and mobile:
// > 30 (Company members mobile priority); desktop corporate items carry no priority (→ 0), so
// an explicit value keeps us last even if the host later adds desktop priorities.
export const NAV_PRIORITY = 40;

// "My customers" page (VCST-5469).
export const MY_CUSTOMERS_ROUTE_NAME = "SalesRepMyCustomers";
export const MY_CUSTOMERS_ROUTE_SEGMENT = "my-customers";
export const MY_CUSTOMERS_NAV_LINK_ID = "sales-rep-my-customers";

// "Sales Rep hub" account left-rail widget (VCST-5469). Registered via useNavigations for reps only.
export const HUB_SECTION_ID = "sales-rep-hub";
// Low priority so the hub leads the account rail, ahead of Purchasing (10).
export const HUB_NAV_PRIORITY = 5;
// Permission that defines a Sales Rep (backend module VirtoCommerce.SalesRep, granted via a role).
export const SALES_REP_ACCESS_PERMISSION = "sales-rep:access";

// Customer profile page (VCST-5308) -> /company/my-customers/:organizationId (a sibling of the
// My customers list under the "Company" parent; the "Sales Rep hub" title comes from the left-rail
// section, not a URL segment).
export const CUSTOMER_PROFILE_ROUTE_NAME = "SalesRepCustomerProfile";
export const CUSTOMER_PROFILE_ROUTE_SEGMENT = `${MY_CUSTOMERS_ROUTE_SEGMENT}/:organizationId`;
// Default page size for the shared sales-rep Orders widget (customer profile + hub dashboard);
// callers may override via the widget's `limit` prop. The full paginated list lives on a
// separate "All orders" page (future story).
export const ORDERS_DEFAULT_LIMIT = 7;

// "Dashboard" — the Sales Rep hub landing page (VCST-5485). Distinct route name from the account
// "Dashboard" (they share the label but live under different parents: /company vs /account).
export const DASHBOARD_ROUTE_NAME = "SalesRepDashboard";
export const DASHBOARD_ROUTE_SEGMENT = "dashboard";
export const DASHBOARD_NAV_LINK_ID = "sales-rep-dashboard";

// --- Dashboard statistics wiring (VCST-5485 concept spike) ---
// Filter-rule name used to back the dashboard "New orders" card. Order filter rules are raw
// order statuses (SalesRepOrderFilterRuleResolver); there is no "on hold" status, so this card is
// backed by the "New" order status and shows the rep's new orders.
// An unrecognized name fails closed (no data) — keep it aligned with a real status.
export const NEW_ORDERS_FILTER = "New";
// Cart filter-rule name for the built-in "active carts" kind (non-empty, non-project carts) — backs the
// dashboard "Active carts" card.
export const ACTIVE_CARTS_FILTER = "active-carts";
// Default number of ranked products shown by the Top Sellers block (backend max is 10).
export const TOP_SELLERS_DEFAULT_TAKE = 5;
