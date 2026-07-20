import { describe, expect, it } from "vitest";
import { customerProfileRoute, dashboardRoute, myCustomersRoute, salesRepsRoute } from "./routes";

// The rep-facing hub pages mount under the org-gated "/company" parent but must stay reachable for a
// sales rep with zero org memberships (their access is `sales-rep:access`, not org membership). They
// clear the inherited `requiresOrganization` gate; the buyer-facing "Sales reps" page keeps it. VCST-5494.
describe("sales-rep routes", () => {
  it.each([
    ["dashboard", dashboardRoute],
    ["my customers", myCustomersRoute],
    ["customer profile", customerProfileRoute],
  ])("clears requiresOrganization on the rep-facing %s route", (_name, route) => {
    expect(route.meta?.requiresOrganization).toBe(false);
  });

  it("leaves the buyer-facing sales-reps route org-gated (inherits /company meta)", () => {
    expect(salesRepsRoute.meta?.requiresOrganization).toBeUndefined();
  });
});
