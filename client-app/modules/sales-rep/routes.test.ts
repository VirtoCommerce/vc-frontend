import { describe, expect, it } from "vitest";
import {
  allCustomerOrdersRoute,
  customerOrderRoute,
  customerOrdersRoute,
  customerProfileRoute,
  dashboardRoute,
  myCustomersRoute,
  salesRepsRoute,
} from "./routes";

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

  // The customer's order list is a child URL of the customer, so the crumb trail back to the profile
  // and to My customers stays derivable from the path alone.
  it("nests the customer orders list under the customer", () => {
    expect(customerOrdersRoute.path).toBe("my-customers/:organizationId/orders");
  });

  // Same reason for one order: the trail back through the list, the profile and My customers is in the path.
  it("nests one order under the customer's order list", () => {
    expect(customerOrderRoute.path).toBe("my-customers/:organizationId/orders/:orderId");
  });

  // A sibling of My customers, since "my-customers/orders" would match the :organizationId segment.
  it("keeps the all-customers order list out of the customer path", () => {
    expect(allCustomerOrdersRoute.path).toBe("customer-orders");
  });

  // No `requiresOrganization: false` override -> it keeps the "/company" parent's org gate.
  it("does not clear the org gate on the sales-reps route", () => {
    expect(salesRepsRoute.meta?.requiresOrganization).not.toBe(false);
  });
});
