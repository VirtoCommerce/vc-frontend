import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAnalytics } from "@/core/composables/useAnalytics";
import { Logger } from "@/core/utilities";
import type { CustomerOrderType, LineItemType, Product } from "../api/graphql/types";
import type { AnalyticsEventNameType, IAnalyticsEventMap, TackerType } from "@/core/types/analytics";

vi.mock("@/core/utilities", () => ({
  Logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/core/constants", () => ({
  IS_DEVELOPMENT: false,
}));

describe("useAnalytics Composable", () => {
  let analyticsInstance: ReturnType<typeof useAnalytics>;
  let addTracker: ReturnType<typeof useAnalytics>["addTracker"];
  let trackEvent: ReturnType<typeof useAnalytics>["analytics"];
  let mockTracker1: TackerType;
  let mockTracker2: TackerType;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    analyticsInstance = useAnalytics();
    addTracker = analyticsInstance.addTracker;
    trackEvent = analyticsInstance.analytics;

    mockTracker1 = {
      viewItemList: vi.fn(),
      selectItem: vi.fn(),
      viewItem: vi.fn(),
      addItemToWishList: vi.fn(),
      addItemToCart: vi.fn(),
      addItemsToCart: vi.fn(),
      removeItemsFromCart: vi.fn(),
      viewCart: vi.fn(),
      clearCart: vi.fn(),
      beginCheckout: vi.fn(),
      addShippingInfo: vi.fn(),
      addPaymentInfo: vi.fn(),
      purchase: vi.fn(),
      placeOrder: vi.fn(),
      search: vi.fn(),
    };

    mockTracker2 = {
      viewItemList: vi.fn(),
      selectItem: vi.fn(),
      viewItem: vi.fn(),
      addItemToWishList: vi.fn(),
      addItemToCart: vi.fn(),
      addItemsToCart: vi.fn(),
      removeItemsFromCart: vi.fn(),
      viewCart: vi.fn(),
      clearCart: vi.fn(),
      beginCheckout: vi.fn(),
      addShippingInfo: vi.fn(),
      addPaymentInfo: vi.fn(),
      purchase: vi.fn(),
      placeOrder: vi.fn(),
      search: vi.fn(),
    };
  });

  it("should dispatch events to a single tracker", () => {
    addTracker(mockTracker1);

    const event: AnalyticsEventNameType = "viewItemList";
    const args: IAnalyticsEventMap["viewItemList"] = [[{ code: "item1" }], { someParam: "value" }];

    trackEvent(event, ...args);

    expect(mockTracker1.viewItemList).toHaveBeenCalledWith(...args);
    expect(Logger.debug).not.toHaveBeenCalled();
    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it("should dispatch events to multiple trackers", () => {
    addTracker(mockTracker1);
    addTracker(mockTracker2);

    const event: AnalyticsEventNameType = "selectItem";
    const args: IAnalyticsEventMap["selectItem"] = [{ productId: "123" } as LineItemType, { someParam: "value" }];

    trackEvent(event, ...args);

    expect(mockTracker1.selectItem).toHaveBeenCalledWith(...args);
    expect(mockTracker2.selectItem).toHaveBeenCalledWith(...args);
    expect(Logger.debug).not.toHaveBeenCalled();
    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it("should handle multiple dispatches of the same event", () => {
    addTracker(mockTracker1);

    const event: AnalyticsEventNameType = "viewItem";
    const args1: IAnalyticsEventMap["viewItem"] = [{ id: "123" } as Product, { someParam: "value1" }];
    const args2: IAnalyticsEventMap["viewItem"] = [{ id: "321" } as Product, { someParam: "value2" }];

    trackEvent(event, ...args1);
    trackEvent(event, ...args2);

    expect(mockTracker1.viewItem).toHaveBeenCalledTimes(2);
    expect(mockTracker1.viewItem).toHaveBeenCalledWith(...args1);
    expect(mockTracker1.viewItem).toHaveBeenCalledWith(...args2);
    expect(Logger.debug).not.toHaveBeenCalled();
    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it("should not dispatch events and log debug in development mode", async () => {
    vi.doMock("@/core/constants", () => ({
      IS_DEVELOPMENT: true,
    }));

    const { useAnalytics: useAnalyticsDev } = await import("@/core/composables/useAnalytics");
    const analyticsDev = useAnalyticsDev();
    const addTrackerDev = analyticsDev.addTracker;
    const trackEventDev = analyticsDev.analytics;

    addTrackerDev(mockTracker1);

    const event: AnalyticsEventNameType = "addItemToCart";
    const args: IAnalyticsEventMap["addItemToCart"] = [{ id: "123" } as Product, 2, { someParam: "value" }];

    trackEventDev(event, ...args);

    expect(mockTracker1.addItemToCart).not.toHaveBeenCalled();
    expect(Logger.debug).toHaveBeenCalledWith("useAnalytics, can't track event in development mode");
    expect(Logger.warn).not.toHaveBeenCalled();
  });

  it("should log a warning if a tracker does not handle the event", () => {
    addTracker(mockTracker1);

    delete mockTracker1.purchase;

    const event: AnalyticsEventNameType = "purchase";
    const args: IAnalyticsEventMap["purchase"] = [
      {
        id: "123",
      } as CustomerOrderType,
      "txn123",
      { someParam: "value" },
    ];

    trackEvent(event, ...args);

    expect(mockTracker1.purchase).toBeUndefined();
    expect(Logger.warn).toHaveBeenCalledWith('useAnalytics, unsupported event: "purchase" in tracker.');
  });

  it("should handle adding the same tracker multiple times", () => {
    addTracker(mockTracker1);
    addTracker(mockTracker1);

    const event: AnalyticsEventNameType = "search";
    const args: IAnalyticsEventMap["search"] = ["query", [{ code: "item1" }], 1];

    trackEvent(event, ...args);

    expect(mockTracker1.search).toHaveBeenCalledTimes(1);
    expect(mockTracker1.search).toHaveBeenCalledWith(...args);
  });

  it("should handle trackers with partial event support gracefully", () => {
    const partialTracker: TackerType = {
      viewItem: vi.fn(),
      search: vi.fn(),
    };

    addTracker(partialTracker);

    const event1: AnalyticsEventNameType = "viewItem";
    const args1: IAnalyticsEventMap["viewItem"] = [
      {
        id: "123",
      } as Product,
      { someParam: "value1" },
    ];

    trackEvent(event1, ...args1);

    expect(partialTracker.viewItem).toHaveBeenCalledWith(...args1);
    expect(Logger.warn).not.toHaveBeenCalled();

    const event2: AnalyticsEventNameType = "purchase";
    const args2: IAnalyticsEventMap["purchase"] = [
      {
        id: "123",
      } as CustomerOrderType,
      "txn123",
      { someParam: "value2" },
    ];

    trackEvent(event2, ...args2);

    expect(partialTracker.purchase).toBeUndefined();
    expect(Logger.warn).toHaveBeenCalledWith('useAnalytics, unsupported event: "purchase" in tracker.');
  });

  it("should continue dispatching events even if one tracker throws an error", () => {
    const faultyTracker: TackerType = {
      viewItem: vi.fn(() => {
        throw new Error("Tracker error");
      }),
    };

    const normalTracker: TackerType = {
      viewItem: vi.fn(),
    };

    addTracker(faultyTracker);
    addTracker(normalTracker);

    const event: AnalyticsEventNameType = "viewItem";
    const args: IAnalyticsEventMap["viewItem"] = [
      {
        id: "123",
      } as Product,
      { someParam: "value" },
    ];

    const loggerErrorSpy = vi.spyOn(Logger, "error");

    trackEvent(event, ...args);

    expect(faultyTracker.viewItem).toHaveBeenCalledWith(...args);
    expect(normalTracker.viewItem).toHaveBeenCalledWith(...args);
    expect(loggerErrorSpy).toHaveBeenCalled();
  });

  it("should not dispatch events and not log warnings when no trackers are added", () => {
    const event: AnalyticsEventNameType = "viewItem";
    const args: IAnalyticsEventMap["viewItem"] = [
      {
        id: "123",
      } as Product,
      { someParam: "value" },
    ];

    trackEvent(event, ...args);

    expect(mockTracker1.viewItem).not.toHaveBeenCalled();
    expect(Logger.warn).not.toHaveBeenCalled();
    expect(Logger.debug).not.toHaveBeenCalled();
  });

  it("should handle a high volume of events and multiple trackers without issues", () => {
    const numTrackers = 10;
    const trackers: TackerType[] = Array.from({ length: numTrackers }, () => ({
      viewItem: vi.fn(),
      search: vi.fn(),
    }));

    trackers.forEach(addTracker);

    const numEvents = 100;
    for (let i = 0; i < numEvents; i++) {
      const event: AnalyticsEventNameType = "viewItem";
      const args: IAnalyticsEventMap["viewItem"] = [
        {
          id: "123",
        } as Product,
        { someParam: `value${i}` },
      ];
      trackEvent(event, ...args);
    }

    trackers.forEach((tracker) => {
      expect(tracker.viewItem).toHaveBeenCalledTimes(numEvents);
      for (let i = 0; i < numEvents; i++) {
        expect(tracker.viewItem).toHaveBeenNthCalledWith(
          i + 1,
          {
            id: "123",
          } as Product,
          { someParam: `value${i}` },
        );
      }
    });

    expect(Logger.warn).not.toHaveBeenCalled();
    expect(Logger.debug).not.toHaveBeenCalled();
  });
});
