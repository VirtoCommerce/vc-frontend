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
