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

// Customer profile (VCST-5308) -> /company/my-customers/:organizationId. A sibling of the list
// under the "Company" parent; opened by clicking a customer in My customers, or by deep link.
export const customerProfileRoute: RouteRecordRaw = {
  path: CUSTOMER_PROFILE_ROUTE_SEGMENT,
  name: CUSTOMER_PROFILE_ROUTE_NAME,
  component: CustomerProfilePage,
  // organizationId flows in as a prop (uniform contract shared by every profile block).
  props: true,
  // Keep the account left rail (Sales Rep Hub widget + sections) visible per the design — the
  // profile renders inside the account/company shell, not full-width like OrderDetails.
  // Same reps-only gate as the list, plus a deep-link id check. The "not served / unknown org"
  // case is resolved lazily on the page (salesRepCustomer -> not-found view), not blocked here.
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
