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

// Mirrors the backend's ModuleConstants.Sharing.CustomerScope. Core declares `sharedWithId` but not this value —
// only this module knows what a "Customer" target means.
export const CUSTOMER_SHARING_SCOPE = "Customer";

// Customer profile page: /company/my-customers/:organizationId, a sibling of the My customers list
// under "Company" (the "Sales Rep hub" title comes from the left-rail section, not a URL segment).
export const CUSTOMER_PROFILE_ROUTE_NAME = "SalesRepCustomerProfile";
export const CUSTOMER_PROFILE_ROUTE_SEGMENT = `${MY_CUSTOMERS_ROUTE_SEGMENT}/:organizationId`;

export const CUSTOMER_ORDERS_ROUTE_NAME = "SalesRepCustomerOrders";
export const CUSTOMER_ORDERS_ROUTE_SEGMENT = `${CUSTOMER_PROFILE_ROUTE_SEGMENT}/orders`;
export const CUSTOMER_ORDER_ROUTE_NAME = "SalesRepCustomerOrder";
export const CUSTOMER_ORDER_ROUTE_SEGMENT = `${CUSTOMER_ORDERS_ROUTE_SEGMENT}/:orderId`;

// The storefront's own order page: an order the rep placed opens there, where their buyer actions still
// work. The hub's page is read-only for everyone.
export const BUYER_ORDER_ROUTE_NAME = "OrderDetails";

// A sibling of My customers rather than a child, since "my-customers/orders" would match the
// :organizationId segment.
export const ALL_CUSTOMER_ORDERS_ROUTE_NAME = "SalesRepAllCustomerOrders";
export const ALL_CUSTOMER_ORDERS_ROUTE_SEGMENT = "customer-orders";

// The organization an order belongs to — not core's CUSTOMER_NAME_FACET_NAME, which is the buyer who placed it.
export const ORDER_CUSTOMER_FACET = "organizationname";
export const CUSTOMER_ORDERS_SORT_FIELDS = { date: "createdDate", total: "total" } as const;
export const CUSTOMER_ORDERS_SORT_DIRECTION = "desc" as const;

// Default page size for the shared Orders widget; callers may override via the `limit` prop.
export const ORDERS_DEFAULT_LIMIT = 7;

// Sales Rep hub landing page; distinct route name from the account "Dashboard" (same label,
// different parents: /company vs /account).
export const DASHBOARD_ROUTE_NAME = "SalesRepDashboard";
export const DASHBOARD_ROUTE_SEGMENT = "dashboard";
export const DASHBOARD_NAV_LINK_ID = "sales-rep-dashboard";

// All-activity page (VCST-5337); a sibling of the hub pages under "Company".
export const ACTIVITIES_ROUTE_NAME = "SalesRepActivities";
export const ACTIVITIES_ROUTE_SEGMENT = "activities";
export const ACTIVITIES_NAV_LINK_ID = "sales-rep-activities";
// Backend paging: take defaults to 20 and caps at 50; take 0 returns counts only (backs the tabs).
export const ACTIVITY_PAGE_SIZE = 20;
// The backend's paging cap (ModuleConstants.Activities.MaxSkip): past it the query returns NO rows while
// totalCount keeps describing the whole set, so the pager stops here.
export const ACTIVITY_MAX_SKIP = 500;
// Compact "My activity" dashboard widget shows the latest few events across all assigned accounts.
export const MY_ACTIVITY_TAKE = 5;
// Category vocabulary of salesRepActivities (the backend types it as free-form String). Ordered —
// the page renders its tabs in this order, whatever order categoryCounts arrives in.
export const ACTIVITY_CATEGORIES = ["orders", "customers", "searches", "productViews", "logins"] as const;
// Categories sourced from tracked analytics (hour-precision buckets), named by the caveat line.
export const GA_ACTIVITY_CATEGORIES = ["searches", "productViews", "logins"] as const;
// Membership sets built once for the module. The arrays above stay: they carry the tab order.
export const TRACKED_ACTIVITY_CATEGORIES = new Set<string>(GA_ACTIVITY_CATEGORIES);
// The categories salesRepCustomerInsights can rank by count — only their tabs offer Top | Recent.
export const RANKED_ACTIVITY_CATEGORIES = new Set<string>(["searches", "productViews"]);

// Document library (VCST-5730). Read permission gates the widget, the page and the nav link;
// write implies read and administrators pass — both are resolved server-side, the client only
// checks for the read permission itself (an admin/writer also carries it through checkPermissions'
// isAdministrator shortcut or the role that grants access).
export const SALES_REP_DOCUMENTS_READ_PERMISSION = "sales-rep-documents:read";
// Layout block id — persisted as block.type in saved layouts, so it is load-bearing (see the saved-layout notes).
export const DOCUMENTS_BLOCK_ID = "documents";
export const DOCUMENTS_ROUTE_NAME = "SalesRepDocuments";
export const DOCUMENTS_ROUTE_SEGMENT = "documents";
export const DOCUMENTS_NAV_LINK_ID = "sales-rep-documents";
// Page size for the browse-all documents page (offset-as-cursor, like useSalesRepCustomers).
// 15 = three full rows of the grid's 5-card cap, so the pager appears only past three rows.
export const DOCUMENTS_PAGE_SIZE = 15;

// Tasks (VCST-5732). Backed by vc-module-task-management, an OPTIONAL backend dependency:
// the feature is gated on that module being installed, not on a setting of ours (see useSalesRepsConfig).
export const TASK_MANAGEMENT_MODULE_ID = "VirtoCommerce.TaskManagement";
export const TASKS_ROUTE_NAME = "SalesRepTasks";
export const TASKS_ROUTE_SEGMENT = "tasks";
export const TASKS_NAV_LINK_ID = "sales-rep-tasks";
// Layout block id — persisted as block.type in saved layouts, so it is load-bearing (see the saved-layout notes).
export const TASKS_BLOCK_ID = "tasks";
// Page size for the Tasks page's task table (offset-as-cursor, like useSalesRepDocuments).
export const TASKS_PAGE_SIZE = 15;
// Dashboard widget row cap — follows documents: default 5, max 10.
export const TASKS_DEFAULT_ROWS = 5;
export const TASKS_MAX_ROWS = 10;
// The one order every task surface asks for. A sort-rule name from salesRepTaskSortRules (an unrecognized name
// fails closed — keep it aligned with a real rule); no surface offers a sort control, so the rule list itself is
// not fetched.
export const TASKS_SORT_RULE = "due-date";
// The filter rule the dashboard's overdue notice deep-links to. Same string the counts query aliases in
// salesRepTaskCountsQuery.graphql; a name the project does not offer falls back to the day view, because
// the chips drop a selection no rule matches.
export const TASKS_OVERDUE_RULE = "overdue";
// Upper bound on the month query behind the calendar dots. A rep's month is tens of tasks; the cap only
// stops a pathological book of business from pulling an unbounded page for three dots a day.
export const TASKS_CALENDAR_MAX = 200;

// Backs the "New orders" card; order filter rules are raw order statuses, so this uses the "New"
// status (an unrecognized name fails closed — keep it aligned with a real status). The card's label
// quotes this status name in every locale, so changing it means retranslating those strings too.
export const NEW_ORDERS_FILTER = "New";
// Cart filter-rule name for the built-in "active carts" kind — backs the "Active carts" card.
export const ACTIVE_CARTS_FILTER = "active-carts";
// Default number of ranked products shown by the Top Sellers block (backend max is 10).
export const TOP_SELLERS_DEFAULT_TAKE = 5;

// Hub variables are day-stable by design (see buildStatisticsWindows), so the client's default
// cache-first serves what a card or list first saw until a page reload. Revalidating is cheap — the
// backend caches these criteria. The rule lists in useSalesRepRules stay cache-first: static data.
export const HUB_FETCH_POLICY: WatchQueryFetchPolicy = "cache-and-network";

// Saved layout (VCST-5367): the module's two dashboards are `LAYOUT_SCOPES.salesRepDashboard` and
// `LAYOUT_SCOPES.salesRepCustomerProfile` in @/shared/dashboard, beside the engine's other load-bearing literals.
// Default row caps, per the design. Below the widgets' own page sizes, which stay the fallback for a
// widget rendered outside a layout.
export const ORDERS_DEFAULT_ROWS = 5;
export const ORDERS_MAX_ROWS = 20;
export const TOP_SELLERS_DEFAULT_ROWS = 5;
// The salesRepTopSellers API caps `take` at 10, so the input must not offer more.
export const TOP_SELLERS_MAX_ROWS = 10;
// Documents widget row cap (VCST-5730) — follows top-sellers: default 5, max 10.
export const DOCUMENTS_DEFAULT_ROWS = 5;
export const DOCUMENTS_MAX_ROWS = 10;

// salesRepCustomerInsights sort names: "count" ranks by occurrences (Top), "date" by the latest hour bucket (Recent).
export const INSIGHTS_DEFAULT_ROWS = 5;
export const INSIGHTS_MAX_ROWS = 20;
export const INSIGHTS_SORT_BY_COUNT = "count";
export const INSIGHTS_SORT_BY_DATE = "date";
