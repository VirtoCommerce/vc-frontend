import { useUser } from "@/shared/account/composables/useUser";
import { isSalesRepsEnabled } from "./composables/useSalesRepsConfig";
import {
  CUSTOMER_PROFILE_ROUTE_NAME,
  CUSTOMER_PROFILE_ROUTE_SEGMENT,
  MY_CUSTOMERS_ROUTE_NAME,
  MY_CUSTOMERS_ROUTE_SEGMENT,
  ROUTE_NAME,
  ROUTE_SEGMENT,
  SALES_REP_ACCESS_PERMISSION,
} from "./constants";
import type { RouteRecordRaw } from "vue-router";

const SalesRepsPage = () => import("./pages/sales-reps.vue");
const MyCustomersPage = () => import("./pages/my-customers.vue");
const CustomerProfilePage = () => import("./pages/customer-profile.vue");

// Reps only: reuse the My customers gate (SalesRep.Enabled + sales-rep:access), else -> Dashboard.
function guardSalesRep(next: (to?: { name: string }) => void): boolean {
  const { checkPermissions } = useUser();
  if (isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION)) {
    return true;
  }
  next({ name: "Dashboard" });
  return false;
}

// Relative path -> mounts under the "Company" parent (/company/sales-reps).
export const salesRepsRoute: RouteRecordRaw = {
  path: ROUTE_SEGMENT,
  name: ROUTE_NAME,
  component: SalesRepsPage,
};

export const myCustomersRoute: RouteRecordRaw = {
  path: MY_CUSTOMERS_ROUTE_SEGMENT,
  name: MY_CUSTOMERS_ROUTE_NAME,
  component: MyCustomersPage,
  // Reps only — non-reps who hit the URL directly are bounced to the dashboard.
  beforeEnter(_to, _from, next) {
    const { checkPermissions } = useUser();
    if (isSalesRepsEnabled() && checkPermissions(SALES_REP_ACCESS_PERMISSION)) {
      next();
    } else {
      next({ name: "Dashboard" });
    }
  },
};

// Customer profile (VCST-5308) -> /company/my-customers/:organizationId.
export const customerProfileRoute: RouteRecordRaw = {
  path: CUSTOMER_PROFILE_ROUTE_SEGMENT,
  name: CUSTOMER_PROFILE_ROUTE_NAME,
  component: CustomerProfilePage,
  props: true,
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
