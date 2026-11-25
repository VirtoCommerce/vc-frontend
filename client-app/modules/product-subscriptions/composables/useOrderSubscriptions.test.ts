import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionIntervalUnit } from "../api/graphql/types";
import { useOrderSubscriptions } from "./useOrderSubscriptions";
import type { GetOrderSubscriptionInfosQuery } from "../api/graphql/types";

type OrderInfoType = GetOrderSubscriptionInfosQuery["orderSubscriptionInfos"][number];

const h = vi.hoisted(() => ({
  getOrderSubscriptionInfos: vi.fn(),
}));

vi.mock("../api/graphql", () => ({
  getOrderSubscriptionInfos: h.getOrderSubscriptionInfos,
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn() },
}));

function renewalInfo(orderId: string, isManualRenewal = false): OrderInfoType {
  return {
    orderId,
    renewalId: `renewal-${orderId}`,
    renewalNumber: `R-${orderId}`,
    renewalScheduledDate: "2026-11-01T00:00:00Z",
    isManualRenewal,
    subscriptions: [
      {
        subscriptionId: `subscription-${orderId}`,
        subscriptionNumber: `S-${orderId}`,
        productId: "product-1",
        intervalUnit: SubscriptionIntervalUnit.Month,
        intervalCount: 1,
        status: "Active",
        isStartedByOrder: false,
      },
    ],
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

// The state is kept for the session, so every test uses orders of its own.
describe("useOrderSubscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asks for the orders of one tick in one request", async () => {
    h.getOrderSubscriptionInfos.mockResolvedValue([renewalInfo("tick-1"), renewalInfo("tick-2")]);
    const { ensure, renewalFor } = useOrderSubscriptions();

    void ensure("tick-1");
    await ensure("tick-2");

    expect(h.getOrderSubscriptionInfos).toHaveBeenCalledTimes(1);
    expect(h.getOrderSubscriptionInfos).toHaveBeenCalledWith(["tick-1", "tick-2"], {
      suppressErrorNotifications: true,
    });
    expect(renewalFor("tick-1").value?.id).toBe("renewal-tick-1");
    expect(renewalFor("tick-2").value?.id).toBe("renewal-tick-2");
  });

  it("keeps the orders of a request that answered while a later request was in flight", async () => {
    const first = deferred<OrderInfoType[]>();
    const second = deferred<OrderInfoType[]>();
    h.getOrderSubscriptionInfos.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { ensure, renewalFor } = useOrderSubscriptions();

    const firstLoad = ensure("page-1");
    await flushPromises();
    const secondLoad = ensure("page-2");
    await flushPromises();

    first.resolve([renewalInfo("page-1")]);
    await firstLoad;
    second.resolve([renewalInfo("page-2")]);
    await secondLoad;

    expect(h.getOrderSubscriptionInfos).toHaveBeenCalledTimes(2);
    expect(renewalFor("page-1").value?.id).toBe("renewal-page-1");
    expect(renewalFor("page-2").value?.id).toBe("renewal-page-2");
  });

  it("does not attribute an order placed with Order now to its renewal", async () => {
    h.getOrderSubscriptionInfos.mockResolvedValue([renewalInfo("manual", true)]);
    const { ensure, renewalFor, subscriptionsOf } = useOrderSubscriptions();

    await ensure("manual");

    expect(renewalFor("manual").value).toBeUndefined();
    expect(subscriptionsOf("manual").value).toEqual([{ id: "subscription-manual", number: "S-manual" }]);
  });
});
