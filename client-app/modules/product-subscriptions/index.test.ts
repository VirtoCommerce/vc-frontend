import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { useCheckoutGuards } from "@/shared/checkout/composables/useCheckoutGuards";
import { getCartSubscriptionItems } from "./api/graphql";
import { useSubscriptionCheckout } from "./composables/useSubscriptionCheckout";
import { init } from "./index";
import type { SubscriptionCartItemFieldsFragment } from "./api/graphql/types";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

vi.mock("@/core/composables", () => ({ useNavigations: () => ({ mergeMenuSchema: vi.fn() }) }));

vi.mock("@/core/composables/useModuleSettings", () => ({ useModuleSettings: () => ({ isEnabled: () => true }) }));

vi.mock("@/shared/account/composables", async () => {
  const { ref } = await import("vue");
  return { useUser: () => ({ isAuthenticated: ref(true) }) };
});

vi.mock("@/shared/account/composables/useUser", async () => {
  const { ref } = await import("vue");
  return { useUser: () => ({ isAuthenticated: ref(true) }) };
});

vi.mock("@/shared/cart/composables", () => ({ useFullCart: vi.fn(), useShortCart: vi.fn() }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({ register: vi.fn() }),
}));

vi.mock("../utils", () => ({ loadModuleLocale: vi.fn() }));

vi.mock("./api/graphql", () => ({ getCartSubscriptionItems: vi.fn(), getSubscriptionOffers: vi.fn() }));

// The terms block is loaded on demand, so the guard is registered at start-up and reads the cart the block reviews.
describe("product subscriptions module init", () => {
  it("registers the checkout guard, which holds a subscription cart until the terms are accepted", async () => {
    vi.mocked(getCartSubscriptionItems).mockResolvedValue([
      { lineItemId: "line-1" } as SubscriptionCartItemFieldsFragment,
    ]);
    init({ addRoute: vi.fn() } as unknown as Router, {} as I18n);
    const { canPlaceOrder } = useCheckoutGuards();

    expect(canPlaceOrder.value).toBe(true);

    useSubscriptionCheckout().cart.value = { id: "cart-1", items: [{ id: "line-1" }] };
    await flushPromises();

    expect(canPlaceOrder.value).toBe(false);
  });
});
