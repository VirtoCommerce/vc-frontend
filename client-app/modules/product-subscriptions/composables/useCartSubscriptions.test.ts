import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useCartSubscriptions } from "./useCartSubscriptions";
import type { ISubscriptionCartType } from "./useCartSubscriptions";

const h = vi.hoisted(() => ({
  getCartSubscriptionItems: vi.fn(),
  getSubscriptionOffers: vi.fn(),
}));

vi.mock("../api/graphql", () => ({
  getCartSubscriptionItems: h.getCartSubscriptionItems,
  getSubscriptionOffers: h.getSubscriptionOffers,
  setCartItemSubscription: vi.fn(),
  removeCartItemSubscription: vi.fn(),
}));

vi.mock("@/shared/account/composables/useUser", async () => {
  const { ref: vueRef } = await import("vue");
  const isAuthenticated = vueRef(true);
  return { useUser: () => ({ isAuthenticated }) };
});

vi.mock("@/shared/cart/composables", () => ({
  useFullCart: () => ({ cart: ref() }),
  useShortCart: () => ({ cart: ref() }),
}));

function subscription(lineItemId: string) {
  return { lineItemId, planId: "plan-1", intervalUnit: "MONTH", intervalCount: 1 };
}

// The module keeps state per cart across tests, so every test uses carts of its own.
describe("useCartSubscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getSubscriptionOffers.mockResolvedValue([]);
  });

  it("counts only the lines that are in the order", async () => {
    h.getCartSubscriptionItems.mockResolvedValue([subscription("line-1"), subscription("line-2")]);
    const cart = ref<ISubscriptionCartType>({
      id: "cart-selected",
      items: [
        { id: "line-1", selectedForCheckout: true },
        { id: "line-2", selectedForCheckout: false },
      ],
    });

    const { subscribedItems, hasSubscriptionItems } = useCartSubscriptions(cart);
    await flushPromises();

    expect(subscribedItems.value.map((x) => x.lineItemId)).toEqual(["line-1"]);
    expect(hasSubscriptionItems.value).toBe(true);

    cart.value = { ...cart.value, items: [{ id: "line-1", selectedForCheckout: false }] };
    expect(hasSubscriptionItems.value).toBe(false);
  });

  it("uses the cart it is given, not another one", async () => {
    h.getCartSubscriptionItems.mockResolvedValue([subscription("line-b")]);

    const { hasSubscriptionItems } = useCartSubscriptions(ref({ id: "cart-b", items: [{ id: "line-b" }] }));
    await flushPromises();

    expect(h.getCartSubscriptionItems).toHaveBeenCalledWith("cart-b");
    expect(hasSubscriptionItems.value).toBe(true);
  });

  it("reports loading, then a failure that a retry recovers from", async () => {
    let fail!: (e: Error) => void;
    h.getCartSubscriptionItems.mockReturnValueOnce(new Promise((_, reject) => (fail = reject)));

    const { loading, failed, refresh, hasSubscriptionItems } = useCartSubscriptions(
      ref({ id: "cart-failing", items: [{ id: "line-1" }] }),
    );
    expect(loading.value).toBe(true);

    fail(new Error("network"));
    await flushPromises();
    expect(loading.value).toBe(false);
    expect(failed.value).toBe(true);

    h.getCartSubscriptionItems.mockResolvedValueOnce([subscription("line-1")]);
    await refresh();
    expect(failed.value).toBe(false);
    expect(hasSubscriptionItems.value).toBe(true);
  });

  it("loads the offers of every product in the cart with one request", async () => {
    h.getCartSubscriptionItems.mockResolvedValue([]);
    const cart = ref({
      id: "cart-offers",
      items: [
        { id: "l1", productId: "p-offers-1" },
        { id: "l2", productId: "p-offers-2" },
        { id: "l3", productId: "p-offers-3" },
      ],
    });

    // one composable per cart line, as the cart page creates them
    useCartSubscriptions(cart, { loadOffers: true });
    useCartSubscriptions(cart, { loadOffers: true });
    useCartSubscriptions(cart, { loadOffers: true });
    await flushPromises();

    expect(h.getSubscriptionOffers).toHaveBeenCalledTimes(1);
    expect(h.getSubscriptionOffers).toHaveBeenCalledWith(["p-offers-1", "p-offers-2", "p-offers-3"]);
  });
});
