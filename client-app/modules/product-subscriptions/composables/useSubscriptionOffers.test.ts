import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSubscriptionOffers } from "./useSubscriptionOffers";

const h = vi.hoisted(() => ({
  getSubscriptionOffers: vi.fn(),
}));

vi.mock("../api/graphql", () => ({
  getSubscriptionOffers: h.getSubscriptionOffers,
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn() },
}));

function offer(productId: string) {
  return { productId, planId: `plan-${productId}`, intervals: [] };
}

// Offers are kept for the session, so every test uses products of its own.
describe("useSubscriptionOffers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks for a product once its offer is known", async () => {
    h.getSubscriptionOffers.mockResolvedValue([offer("p-ok")]);
    const { loadOffers, offerFor } = useSubscriptionOffers();

    await loadOffers(["p-ok"]);
    await loadOffers(["p-ok"]);

    expect(h.getSubscriptionOffers).toHaveBeenCalledTimes(1);
    expect(offerFor("p-ok")?.planId).toBe("plan-p-ok");
  });

  it("asks again for the products of a failed request", async () => {
    h.getSubscriptionOffers.mockRejectedValueOnce(new Error("network"));
    h.getSubscriptionOffers.mockResolvedValueOnce([offer("p-failed")]);
    const { loadOffers, offerFor } = useSubscriptionOffers();

    await loadOffers(["p-failed"]);
    expect(offerFor("p-failed")).toBeUndefined();

    await loadOffers(["p-failed"]);

    expect(h.getSubscriptionOffers).toHaveBeenCalledTimes(2);
    expect(h.getSubscriptionOffers).toHaveBeenLastCalledWith(["p-failed"]);
    expect(offerFor("p-failed")?.planId).toBe("plan-p-failed");
  });
});
