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

// The customer's full order history: /company/my-customers/:organizationId/orders.
export const CUSTOMER_ORDERS_ROUTE_NAME = "SalesRepCustomerOrders";
export const CUSTOMER_ORDERS_ROUTE_SEGMENT = `${CUSTOMER_PROFILE_ROUTE_SEGMENT}/orders`;
// One order, read-only: /company/my-customers/:organizationId/orders/:orderId.
export const CUSTOMER_ORDER_ROUTE_NAME = "SalesRepCustomerOrder";
export const CUSTOMER_ORDER_ROUTE_SEGMENT = `${CUSTOMER_ORDERS_ROUTE_SEGMENT}/:orderId`;

// Every served customer's orders: /company/customer-orders. A sibling of My customers rather than a child,
// since "my-customers/orders" would match the :organizationId segment.
export const ALL_CUSTOMER_ORDERS_ROUTE_NAME = "SalesRepAllCustomerOrders";
export const ALL_CUSTOMER_ORDERS_ROUTE_SEGMENT = "customer-orders";

// Index field the customer-orders list aggregates over: the status options and their counts come back with
// the page itself, in term_facets, rather than from a separate rules query.
export const ORDER_STATUS_FACET = "status";
// Second facet on the all-customers list: which customer each order belongs to. Faceted by name rather
// than id so the options carry a readable label without a second lookup.
export const ORDER_CUSTOMER_FACET = "organizationname";
// Sortable columns of the customer-orders table, mapped to the index fields the backend sorts on. Both are
// freely reversible, and both read newest/biggest first, so the expression always carries a direction.
export const CUSTOMER_ORDERS_SORT_FIELDS = { date: "createdDate", total: "total" } as const;
export const CUSTOMER_ORDERS_SORT_DIRECTION = "desc" as const;

// Default page size for the shared Orders widget; callers may override via the `limit` prop.
export const ORDERS_DEFAULT_LIMIT = 7;

// Sales Rep hub landing page; distinct route name from the account "Dashboard" (same label,
// different parents: /company vs /account).
export const DASHBOARD_ROUTE_NAME = "SalesRepDashboard";
export const DASHBOARD_ROUTE_SEGMENT = "dashboard";
export const DASHBOARD_NAV_LINK_ID = "sales-rep-dashboard";

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

// Saved layout (VCST-5367). The backend types `scope` and `region.id` as free-form `String`, not
// enums — an unrecognized value does not error, it silently addresses a different (empty) document.
// So these literals are load-bearing: changing one strands every layout already saved under the old
// value. `layout/document.test.ts` and `composables/useSalesRepLayout.test.ts` pin them.
export const LAYOUT_SCHEMA_VERSION = 1;
export const DASHBOARD_LAYOUT_SCOPE = "dashboard";
export const CUSTOMER_PROFILE_LAYOUT_SCOPE = "customerProfile";
// Ordered so serialization always emits regions in a stable sequence.
export const LAYOUT_REGION_IDS = ["statistics", "mainLeft", "mainRight"] as const;
// What a widget can be dragged by: its whole header. `.vc-widget__header-container` is a VcWidget
// internal, not a published contract, so a rename there silently kills header drags —
// `layout-block-widget.test.ts` mounts a real widget against this to catch it.
export const WIDGET_DRAG_HANDLE_SELECTOR = ".vc-widget__header-container";
// Controls that sit inside that header, so without this a mousedown on ✕ or in the rows field starts
// a drag instead. SortableJS `filter` takes a comma-separated selector list.
export const WIDGET_DRAG_FILTER_SELECTOR = ".layout-widget__hide, .layout-widget__rows";

// Per-widget settings (VCST-5649), persisted as scalars in each block's `settings` list. Like the
// scope and region ids above these strings are load-bearing: renaming one strands every saved value.
export const SETTING_MAX_ROWS = "maxRows";
// One sibling key per rule the rep unchecked; a checked rule writes nothing, so a status the backend
// adds later shows up checked without a migration.
export const SETTING_HIDDEN_TAB_PREFIX = "tab.";
// Default row caps, per the design. Below the widgets' own page sizes, which stay the fallback for a
// widget rendered outside a layout.
export const ORDERS_DEFAULT_ROWS = 5;
export const ORDERS_MAX_ROWS = 20;
export const TOP_SELLERS_DEFAULT_ROWS = 5;
// The salesRepTopSellers API caps `take` at 10, so the input must not offer more.
export const TOP_SELLERS_MAX_ROWS = 10;
export const MIN_ROWS = 1;
