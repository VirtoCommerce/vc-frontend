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

function offersOf(ids: string[]) {
  return ids.map(offer);
}

function productIds(prefix: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
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

  it("asks for the products of several calls in one tick in one request", async () => {
    h.getSubscriptionOffers.mockImplementation((ids: string[]) => Promise.resolve(offersOf(ids)));
    const { loadOffers, offerFor } = useSubscriptionOffers();

    await Promise.all([loadOffers(["tick-1"]), loadOffers(["tick-2", "tick-3"])]);

    expect(h.getSubscriptionOffers).toHaveBeenCalledTimes(1);
    expect(h.getSubscriptionOffers).toHaveBeenCalledWith(["tick-1", "tick-2", "tick-3"]);
    expect(offerFor("tick-3")?.planId).toBe("plan-tick-3");
  });

  it("splits more than 100 products into requests of at most 100", async () => {
    h.getSubscriptionOffers.mockImplementation((ids: string[]) => Promise.resolve(offersOf(ids)));
    const { loadOffers, offerFor } = useSubscriptionOffers();
    const ids = productIds("many", 101);

    await loadOffers(ids);

    expect(h.getSubscriptionOffers).toHaveBeenCalledTimes(2);
    expect(h.getSubscriptionOffers).toHaveBeenNthCalledWith(1, ids.slice(0, 100));
    expect(h.getSubscriptionOffers).toHaveBeenNthCalledWith(2, ids.slice(100));
    expect(offerFor("many-100")?.planId).toBe("plan-many-100");
  });

  it("waits for a product already being fetched instead of asking for it again", async () => {
    let answer!: (value: ReturnType<typeof offersOf>) => void;
    h.getSubscriptionOffers.mockReturnValueOnce(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );
    const { loadOffers, offerFor } = useSubscriptionOffers();

    const first = loadOffers(["in-flight"]);
    await Promise.resolve();
    let secondDone = false;
    const second = loadOffers(["in-flight"]).then(() => {
      secondDone = true;
    });
    await Promise.resolve();
    expect(secondDone).toBe(false);

    answer(offersOf(["in-flight"]));
    await Promise.all([first, second]);

    expect(h.getSubscriptionOffers).toHaveBeenCalledTimes(1);
    expect(offerFor("in-flight")?.planId).toBe("plan-in-flight");
  });

  it("asks again only for the batch that failed", async () => {
    const ids = productIds("partial", 101);
    h.getSubscriptionOffers
      .mockImplementationOnce((batch: string[]) => Promise.resolve(offersOf(batch)))
      .mockRejectedValueOnce(new Error("network"))
      .mockImplementationOnce((batch: string[]) => Promise.resolve(offersOf(batch)));
    const { loadOffers, offerFor } = useSubscriptionOffers();

    await loadOffers(ids);
    expect(offerFor("partial-100")).toBeUndefined();

    await loadOffers(ids);

    expect(h.getSubscriptionOffers).toHaveBeenCalledTimes(3);
    expect(h.getSubscriptionOffers).toHaveBeenLastCalledWith(["partial-100"]);
    expect(offerFor("partial-0")?.planId).toBe("plan-partial-0");
    expect(offerFor("partial-100")?.planId).toBe("plan-partial-100");
  });
});
