import { describe, expect, it } from "vitest";
import { BUYER_ORDER_ROUTE_NAME, CUSTOMER_ORDER_ROUTE_NAME } from "./constants";
import { salesRepOrderRoute } from "./utils";
import type { SalesRepCustomerOrderRowType } from "./types";

describe("salesRepOrderRoute", () => {
  const row = (isOwn: boolean): SalesRepCustomerOrderRowType => ({
    id: "o-1",
    number: "CO260821-00001",
    organizationId: "org-of-the-order",
    organizationName: "Contoso Bank",
    createdDate: "2026-08-21T00:00:00Z",
    status: "New",
    statusDisplayValue: "New",
    total: "$10.00",
    isOwn,
  });

  it("sends an order the rep placed to the buyer-facing page", () => {
    expect(salesRepOrderRoute(row(true), "org-in-the-url")).toEqual({
      name: BUYER_ORDER_ROUTE_NAME,
      params: { orderId: "o-1" },
    });
  });

  it("sends someone else's order to the read-only hub page", () => {
    expect(salesRepOrderRoute(row(false), "org-in-the-url")).toEqual({
      name: CUSTOMER_ORDER_ROUTE_NAME,
      params: { organizationId: "org-in-the-url", orderId: "o-1" },
    });
  });

  it("falls back to the order's own customer when the page has none", () => {
    expect(salesRepOrderRoute(row(false))).toEqual({
      name: CUSTOMER_ORDER_ROUTE_NAME,
      params: { organizationId: "org-of-the-order", orderId: "o-1" },
    });
  });
});
