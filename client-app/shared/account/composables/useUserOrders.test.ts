import { describe, expect, it, vi } from "vitest";
import { useUserOrders } from "./useUserOrders";

const api = await vi.hoisted(async () => {
  const { vi: vitest } = await import("vitest");
  const response = { items: [], totalCount: 0, term_facets: [] };
  return {
    getOrders: vitest.fn().mockResolvedValue(response),
    getOrganizationOrders: vitest.fn().mockResolvedValue(response),
  };
});

vi.mock("@/core/api/graphql/orders", () => api);

describe("useUserOrders organization scope", () => {
  it("sends the given organizationId, so a caller can read another organization's orders", async () => {
    const { fetchOrders } = useUserOrders({ organizationId: "org-1" });

    await fetchOrders("organization");

    expect(api.getOrganizationOrders).toHaveBeenCalledWith(expect.objectContaining({ organizationId: "org-1" }));
  });

  // getOrganizationOrders defaults the id from globals, which an explicit `undefined` would overwrite.
  it("omits the key entirely when no organizationId is given", async () => {
    const { fetchOrders } = useUserOrders({});

    await fetchOrders("organization");

    const payload = api.getOrganizationOrders.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("organizationId");
  });

  // The GetOrders operation declares no such variable.
  it("keeps the organizationId out of the private-scope query", async () => {
    const { fetchOrders } = useUserOrders({ organizationId: "org-1" });

    await fetchOrders("private");

    const payload = api.getOrders.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("organizationId");
  });
});
