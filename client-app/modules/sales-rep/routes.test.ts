import { describe, expect, it, vi } from "vitest";
import {
  allCustomerOrdersRoute,
  customerOrderRoute,
  customerOrdersRoute,
  customerProfileRoute,
  dashboardRoute,
  myCustomersRoute,
  salesRepsRoute,
} from "./routes";
import type { NavigationGuard, RouteLocationNormalized, RouteRecordRaw } from "vue-router";

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ checkPermissions: () => true }),
}));
vi.mock("./composables/useSalesRepsConfig", () => ({ isSalesRepsEnabled: () => true }));

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
  it.each([
    ["dashboard", dashboardRoute],
    ["my customers", myCustomersRoute],
    ["customer profile", customerProfileRoute],
    ["customer orders", customerOrdersRoute],
    ["customer order", customerOrderRoute],
    ["all customer orders", allCustomerOrdersRoute],
  ])("lets a sales rep through the %s route", (_name, route: RouteRecordRaw) => {
    const next = vi.fn();
    const to = { params: { organizationId: "org-1", orderId: "o-1" } } as unknown as RouteLocationNormalized;

    (route.beforeEnter as NavigationGuard)(to, to, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  // No `requiresOrganization: false` override -> it keeps the "/company" parent's org gate.
  it("does not clear the org gate on the sales-reps route", () => {
    expect(salesRepsRoute.meta?.requiresOrganization).not.toBe(false);
  });
});
