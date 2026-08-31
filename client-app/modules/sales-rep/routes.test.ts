import { describe, expect, it } from "vitest";
import {
  activitiesRoute,
  customerProfileRoute,
  dashboardRoute,
  documentsRoute,
  isCustomerScopedActivity,
  isMyActivity,
  isMyCustomersArea,
  myCustomersRoute,
  salesRepsRoute,
} from "./routes";
import type { RouteLocationNormalizedLoaded } from "vue-router";

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
