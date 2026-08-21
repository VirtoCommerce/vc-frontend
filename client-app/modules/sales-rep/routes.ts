import { useUser } from "@/shared/account/composables/useUser";
import { isSalesRepsEnabled } from "./composables/useSalesRepsConfig";
import {
  ALL_CUSTOMER_ORDERS_ROUTE_NAME,
  ALL_CUSTOMER_ORDERS_ROUTE_SEGMENT,
  CUSTOMER_ORDERS_ROUTE_NAME,
  CUSTOMER_ORDERS_ROUTE_SEGMENT,
  CUSTOMER_ORDER_ROUTE_NAME,
  CUSTOMER_ORDER_ROUTE_SEGMENT,
  CUSTOMER_PROFILE_ROUTE_NAME,
  CUSTOMER_PROFILE_ROUTE_SEGMENT,
  DASHBOARD_ROUTE_NAME,
  DASHBOARD_ROUTE_SEGMENT,
  MY_CUSTOMERS_ROUTE_NAME,
  MY_CUSTOMERS_ROUTE_SEGMENT,
  ROUTE_NAME,
  ROUTE_SEGMENT,
  SALES_REP_ACCESS_PERMISSION,
} from "./constants";
import type { NavigationGuard, RouteRecordRaw } from "vue-router";

const SalesRepsPage = () => import("./pages/sales-reps.vue");
const CustomerOrdersPage = () => import("./pages/customer-orders.vue");
const CustomerOrderDetailsPage = () => import("./pages/customer-order-details.vue");
const MyCustomersPage = () => import("./pages/my-customers.vue");
const CustomerProfilePage = () => import("./pages/customer-profile.vue");
const DashboardPage = () => import("./pages/dashboard.vue");

// Reps only: reuse the My customers gate (SalesRep.Enabled + sales-rep:access), else -> Dashboard.
function guardSalesRep(next: (to?: { name: string }) => void): boolean {
  const { checkPermissions } = useUser();
  if (isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION)) {
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

const guardCustomerRoute: NavigationGuard = (to, _from, next) => {
  if (!guardSalesRep(next)) {
    return;
  }
  const id = to.params.organizationId;
  if (id && typeof id === "string") {
    next();
  } else {
    next({ name: MY_CUSTOMERS_ROUTE_NAME });
  }
};

const guardRepRoute: NavigationGuard = (_to, _from, next) => {
  if (guardSalesRep(next)) {
    next();
  }
};

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
  beforeEnter: guardRepRoute,
};

export const myCustomersRoute: RouteRecordRaw = {
  path: MY_CUSTOMERS_ROUTE_SEGMENT,
  name: MY_CUSTOMERS_ROUTE_NAME,
  component: MyCustomersPage,
  meta: repRouteMeta,
  beforeEnter: guardRepRoute,
};

// Customer profile (VCST-5308) -> /company/my-customers/:organizationId.
export const customerProfileRoute: RouteRecordRaw = {
  path: CUSTOMER_PROFILE_ROUTE_SEGMENT,
  name: CUSTOMER_PROFILE_ROUTE_NAME,
  component: CustomerProfilePage,
  props: true,
  meta: repRouteMeta,
  beforeEnter: guardCustomerRoute,
};

export const customerOrdersRoute: RouteRecordRaw = {
  path: CUSTOMER_ORDERS_ROUTE_SEGMENT,
  name: CUSTOMER_ORDERS_ROUTE_NAME,
  component: CustomerOrdersPage,
  props: true,
  meta: repRouteMeta,
  beforeEnter: guardCustomerRoute,
};

export const customerOrderRoute: RouteRecordRaw = {
  path: CUSTOMER_ORDER_ROUTE_SEGMENT,
  name: CUSTOMER_ORDER_ROUTE_NAME,
  component: CustomerOrderDetailsPage,
  props: true,
  meta: repRouteMeta,
  beforeEnter: guardCustomerRoute,
};

// No customer in the route, so the page needs no id check — only the reps-only gate.
export const allCustomerOrdersRoute: RouteRecordRaw = {
  path: ALL_CUSTOMER_ORDERS_ROUTE_SEGMENT,
  name: ALL_CUSTOMER_ORDERS_ROUTE_NAME,
  component: CustomerOrdersPage,
  meta: repRouteMeta,
  beforeEnter: guardRepRoute,
};
