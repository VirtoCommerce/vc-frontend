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
