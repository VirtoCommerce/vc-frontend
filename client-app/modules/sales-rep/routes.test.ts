import { describe, expect, it, vi } from "vitest";
import {
  activitiesRoute,
  allCustomerOrdersRoute,
  customerOrderRoute,
  customerOrdersRoute,
  customerProfileRoute,
  dashboardRoute,
  documentsRoute,
  isCustomerScopedActivity,
  isMyActivity,
  isMyCustomersArea,
  myCustomersRoute,
  salesRepsRoute,
} from "./routes";
import type {
  NavigationGuard,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteRecordRaw,
} from "vue-router";

vi.mock("@/shared/account/composables/useUser", () => ({
  useUser: () => ({ checkPermissions: () => true }),
}));
vi.mock("./composables/useSalesRepsConfig", () => ({ isSalesRepsEnabled: () => true }));

const at = (name: string, query: Record<string, string> = {}) =>
  ({ name, query }) as unknown as RouteLocationNormalizedLoaded;

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
    ["activities", activitiesRoute],
  ])("clears requiresOrganization on the rep-facing %s route", (_name, route) => {
    expect(route.meta?.requiresOrganization).toBe(false);
  });

  // The per-customer variant arrives as ?organizationId=; anything else must not reach the page prop.
  it("maps only a string organizationId query param into the activities page prop", () => {
    const props = activitiesRoute.props as (route: { query: Record<string, unknown> }) => {
      organizationId?: string;
    };

    expect(props({ query: { organizationId: "org1" } })).toEqual({ organizationId: "org1" });
    expect(props({ query: {} })).toEqual({ organizationId: undefined });
    expect(props({ query: { organizationId: ["a", "b"] } })).toEqual({ organizationId: undefined });
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

// The rail marks a link active by route record, so an area spanning sibling records has to say so.
// One route serves both feeds here: ?organizationId= makes it a page about a customer.
describe("sales-rep account rail areas", () => {
  it.each([
    ["the customer list", at("SalesRepMyCustomers"), true, false],
    ["a customer profile", at("SalesRepCustomerProfile"), true, false],
    ["a customer's activity", at("SalesRepActivities", { organizationId: "org-1" }), true, false],
    ["the rep's own activity", at("SalesRepActivities"), false, true],
    ["the dashboard", at("SalesRepDashboard"), false, false],
  ])("lights My customers=%s / My activity for %s", (_name, route, inCustomers, inActivity) => {
    expect(isMyCustomersArea(route)).toBe(inCustomers);
    expect(isMyActivity(route)).toBe(inActivity);
  });

  it("treats an empty organizationId as the rep's own feed", () => {
    expect(isCustomerScopedActivity(at("SalesRepActivities", { organizationId: "" }))).toBe(false);
    expect(isMyActivity(at("SalesRepActivities", { organizationId: "" }))).toBe(true);
  });
});
