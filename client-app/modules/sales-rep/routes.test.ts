import { describe, expect, it } from "vitest";
import { activitiesRoute, customerProfileRoute, dashboardRoute, myCustomersRoute, salesRepsRoute } from "./routes";

// The rep-facing hub pages mount under the org-gated "/company" parent but must stay reachable for a
// sales rep with zero org memberships (their access is `sales-rep:access`, not org membership). They
// clear the inherited `requiresOrganization` gate; the buyer-facing "Sales reps" page keeps it. VCST-5494.
describe("sales-rep routes", () => {
  it.each([
    ["dashboard", dashboardRoute],
    ["my customers", myCustomersRoute],
    ["customer profile", customerProfileRoute],
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
