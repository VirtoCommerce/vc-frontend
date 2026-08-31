import { useUser } from "@/shared/account/composables/useUser";
import { isSalesRepsEnabled } from "./composables/useSalesRepsConfig";
import {
  ACTIVITIES_ROUTE_NAME,
  ACTIVITIES_ROUTE_SEGMENT,
  CUSTOMER_PROFILE_ROUTE_NAME,
  CUSTOMER_PROFILE_ROUTE_SEGMENT,
  DASHBOARD_ROUTE_NAME,
  DASHBOARD_ROUTE_SEGMENT,
  DOCUMENTS_ROUTE_NAME,
  DOCUMENTS_ROUTE_SEGMENT,
  MY_CUSTOMERS_ROUTE_NAME,
  MY_CUSTOMERS_ROUTE_SEGMENT,
  ROUTE_NAME,
  ROUTE_SEGMENT,
  SALES_REP_ACCESS_PERMISSION,
  SALES_REP_DOCUMENTS_READ_PERMISSION,
} from "./constants";
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from "vue-router";

const SalesRepsPage = () => import("./pages/sales-reps.vue");
const MyCustomersPage = () => import("./pages/my-customers.vue");
const CustomerProfilePage = () => import("./pages/customer-profile.vue");
const DashboardPage = () => import("./pages/dashboard.vue");
const ActivitiesPage = () => import("./pages/activities.vue");
const DocumentsPage = () => import("./pages/documents.vue");

// Reps only: the My customers gate (SalesRep.Enabled + sales-rep:access) AND every extra permission
// the page names (checkPermissions is a variadic AND; admins pass), else -> Dashboard.
function guardSalesRep(next: (to?: { name: string }) => void, ...extraPermissions: string[]): boolean {
  const { checkPermissions } = useUser();
  if (isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION, ...extraPermissions)) {
    return true;
  }
  next({ name: "Dashboard" });
  return false;
}

// Rep-facing hub pages mount under the "/company" parent (for URL/layout reasons) which carries
// `requiresOrganization: true`. But a sales rep serves organizations they don't belong to — their
// access is defined by `sales-rep:access`, not org membership — so a rep with zero org memberships
// would otherwise be bounced to Dashboard before these pages could mount. Clearing the inherited
// gate here lets them through (child meta overrides parent meta in vue-router); the `beforeEnter`
// guards below still enforce reps-only access. VCST-5494.
const repRouteMeta = { requiresOrganization: false };

// Relative path -> mounts under the "Company" parent (/company/sales-reps).
export const salesRepsRoute: RouteRecordRaw = {
  path: ROUTE_SEGMENT,
  name: ROUTE_NAME,
  component: SalesRepsPage,
};

// "Dashboard" — Sales Rep hub landing (VCST-5485) -> /company/dashboard.
export const dashboardRoute: RouteRecordRaw = {
  path: DASHBOARD_ROUTE_SEGMENT,
  name: DASHBOARD_ROUTE_NAME,
  component: DashboardPage,
  meta: repRouteMeta,
  // Reps only — non-reps who hit the URL directly are bounced to the account dashboard.
  beforeEnter(_to, _from, next) {
    if (guardSalesRep(next)) {
      next();
    }
  },
};

export const myCustomersRoute: RouteRecordRaw = {
  path: MY_CUSTOMERS_ROUTE_SEGMENT,
  name: MY_CUSTOMERS_ROUTE_NAME,
  component: MyCustomersPage,
  meta: repRouteMeta,
  // Reps only — non-reps who hit the URL directly are bounced to the dashboard.
  beforeEnter(_to, _from, next) {
    if (guardSalesRep(next)) {
      next();
    }
  },
};

// Document library (VCST-5730) -> /company/documents. Beyond rep access it needs the documents
// read permission — the same gate that hides the nav link and the dashboard widget.
export const documentsRoute: RouteRecordRaw = {
  path: DOCUMENTS_ROUTE_SEGMENT,
  name: DOCUMENTS_ROUTE_NAME,
  component: DocumentsPage,
  meta: repRouteMeta,
  beforeEnter(_to, _from, next) {
    if (guardSalesRep(next, SALES_REP_DOCUMENTS_READ_PERMISSION)) {
      next();
    }
  },
};

// All-activity feed (VCST-5337) -> /company/activities; ?organizationId= narrows to one customer.
export const activitiesRoute: RouteRecordRaw = {
  path: ACTIVITIES_ROUTE_SEGMENT,
  name: ACTIVITIES_ROUTE_NAME,
  component: ActivitiesPage,
  meta: repRouteMeta,
  // The optional narrowing arrives as a query param; unknown/foreign orgs null server-side.
  props: (route) => ({
    organizationId: typeof route.query.organizationId === "string" ? route.query.organizationId : undefined,
  }),
  // Reps only — non-reps who hit the URL directly are bounced to the dashboard.
  beforeEnter(_to, _from, next) {
    if (guardSalesRep(next)) {
      next();
    }
  },
};

// Customer profile (VCST-5308) -> /company/my-customers/:organizationId.
export const customerProfileRoute: RouteRecordRaw = {
  path: CUSTOMER_PROFILE_ROUTE_SEGMENT,
  name: CUSTOMER_PROFILE_ROUTE_NAME,
  component: CustomerProfilePage,
  props: true,
  meta: repRouteMeta,
  // Reps-only gate + deep-link id check; the not-served/unknown-org case is handled on the page.
  beforeEnter(to, _from, next) {
    if (!guardSalesRep(next)) {
      return;
    }
    const id = to.params.organizationId;
    if (id && typeof id === "string") {
      next();
    } else {
      next({ name: MY_CUSTOMERS_ROUTE_NAME });
    }
  },
};

// One route serves two things: "my activity" across every assigned customer, and a single customer's
// activity (?organizationId=). Only the first is the rep's own — the second is a page about a
// customer, reached from their profile.
export function isCustomerScopedActivity(route: RouteLocationNormalizedLoaded): boolean {
  return route.name === ACTIVITIES_ROUTE_NAME && Boolean(route.query.organizationId);
}

// The pages that belong to "My customers": the list, one customer's profile, and that customer's
// activity. Spelled out because vue-router marks a link active by route RECORD — these are sibling
// records under /company, so it cannot see that they are one area.
export function isMyCustomersArea(route: RouteLocationNormalizedLoaded): boolean {
  return (
    route.name === MY_CUSTOMERS_ROUTE_NAME ||
    route.name === CUSTOMER_PROFILE_ROUTE_NAME ||
    isCustomerScopedActivity(route)
  );
}

// "My activity" owns the feed only while it really is the rep's own.
export function isMyActivity(route: RouteLocationNormalizedLoaded): boolean {
  return route.name === ACTIVITIES_ROUTE_NAME && !isCustomerScopedActivity(route);
}
