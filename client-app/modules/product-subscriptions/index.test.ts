import { describe, expect, it, vi } from "vitest";
import { useCheckoutGuards } from "@/shared/checkout/composables/useCheckoutGuards";
import { init } from "./index";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

vi.mock("@/core/composables", () => ({ useNavigations: () => ({ mergeMenuSchema: vi.fn() }) }));

vi.mock("@/core/composables/useModuleSettings", () => ({ useModuleSettings: () => ({ isEnabled: () => true }) }));

vi.mock("@/shared/account/composables", async () => {
  const { ref } = await import("vue");
  return { useUser: () => ({ isAuthenticated: ref(false) }) };
});

vi.mock("@/shared/account/composables/useUser", async () => {
  const { ref } = await import("vue");
  return { useUser: () => ({ isAuthenticated: ref(false) }) };
});

vi.mock("@/shared/cart/composables", () => ({ useFullCart: vi.fn(), useShortCart: vi.fn() }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({ register: vi.fn() }),
}));

vi.mock("../utils", () => ({ loadModuleLocale: vi.fn() }));

vi.mock("./api/graphql", () => ({ getCartSubscriptionItems: vi.fn(), getSubscriptionOffers: vi.fn() }));

// The terms block is loaded on demand; Place order must not be open while its chunk loads or when it fails to load.
describe("product subscriptions module init", () => {
  it("registers the checkout guard at start-up, closed until the terms block shows the cart", () => {
    init({ addRoute: vi.fn() } as unknown as Router, {} as I18n);

    expect(useCheckoutGuards().canPlaceOrder.value).toBe(false);
  });
});
