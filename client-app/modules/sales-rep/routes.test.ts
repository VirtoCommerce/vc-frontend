import { afterEach, describe, expect, it, vi } from "vitest";
import { DASHBOARD_ROUTE_NAME } from "./constants";
import {
  allCustomerOrdersRoute,
  customerOrderRoute,
  customerOrdersRoute,
  customerProfileRoute,
  dashboardRoute,
  documentsRoute,
  myCustomersRoute,
  salesRepsRoute,
  tasksRoute,
} from "./routes";
import type { NavigationGuard, RouteLocationNormalized, RouteRecordRaw } from "vue-router";

const access = vi.hoisted(() => ({ isRep: true, tasksEnabled: true }));

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ checkPermissions: () => access.isRep }),
}));
vi.mock("./composables/useSalesRepsConfig", () => ({
  isSalesRepsEnabled: () => true,
  isSalesRepTasksEnabled: () => access.tasksEnabled,
}));

const to = { params: { organizationId: "org-1", orderId: "o-1" } } as unknown as RouteLocationNormalized;

// Every hub route behind guardSalesRep.
const GUARDED_REP_ROUTES: [string, RouteRecordRaw][] = [
  ["dashboard", dashboardRoute],
  ["my customers", myCustomersRoute],
  ["customer profile", customerProfileRoute],
  ["customer orders", customerOrdersRoute],
  ["customer order", customerOrderRoute],
  ["all customer orders", allCustomerOrdersRoute],
  ["documents", documentsRoute],
  ["tasks", tasksRoute],
];

function runGuard(route: RouteRecordRaw) {
  const next = vi.fn();
  (route.beforeEnter as NavigationGuard)(to, to, next);
  return next;
}

afterEach(() => {
  access.isRep = true;
  access.tasksEnabled = true;
});

// The rep-facing hub pages mount under the org-gated "/company" parent but must stay reachable for a
// sales rep with zero org memberships (their access is `sales-rep:access`, not org membership). They
// clear the inherited `requiresOrganization` gate; the buyer-facing "Sales reps" page keeps it. VCST-5494.
describe("sales-rep routes", () => {
  it.each([
    ["dashboard", dashboardRoute],
    ["my customers", myCustomersRoute],
    ["customer profile", customerProfileRoute],
    ["customer orders", customerOrdersRoute],
    ["customer order", customerOrderRoute],
    ["all customer orders", allCustomerOrdersRoute],
    ["documents", documentsRoute],
  ])("clears requiresOrganization on the rep-facing %s route", (_name, route) => {
    expect(route.meta?.requiresOrganization).toBe(false);
  });

  it("nests the customer orders list under the customer", () => {
    expect(customerOrdersRoute.path).toBe("my-customers/:organizationId/orders");
  });

  it("nests one order under the customer's order list", () => {
    expect(customerOrderRoute.path).toBe("my-customers/:organizationId/orders/:orderId");
  });

  // A sibling of My customers, since "my-customers/orders" would match the :organizationId segment.
  it("keeps the all-customers order list out of the customer path", () => {
    expect(allCustomerOrdersRoute.path).toBe("customer-orders");
  });

  // guardSalesRep only calls next() to bounce a non-rep, so a beforeEnter that forgets to call it on the way
  // through leaves the click doing nothing at all.
  it.each(GUARDED_REP_ROUTES)("lets a sales rep through the %s route", (_name, route: RouteRecordRaw) => {
    const next = runGuard(route);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it.each(GUARDED_REP_ROUTES)(
    "resolves the %s route exactly once, to the account Dashboard, for a non-rep",
    (_name, route: RouteRecordRaw) => {
      access.isRep = false;

      const next = runGuard(route);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: "Dashboard" });
    },
  );

  it("sends a sales rep to the hub dashboard when task management is not installed", () => {
    access.tasksEnabled = false;

    const next = runGuard(tasksRoute);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: DASHBOARD_ROUTE_NAME });
  });

  // No `requiresOrganization: false` override -> it keeps the "/company" parent's org gate.
  it("does not clear the org gate on the sales-reps route", () => {
    expect(salesRepsRoute.meta?.requiresOrganization).not.toBe(false);
  });
});
