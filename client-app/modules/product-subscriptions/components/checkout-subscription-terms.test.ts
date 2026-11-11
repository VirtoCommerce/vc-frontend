import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutSubscriptionTerms from "./checkout-subscription-terms.vue";
import type { CartType } from "@/core/api/graphql/types";

const STORAGE_KEY = "vc-card-saving-requirement";

const h = vi.hoisted(() => ({
  acceptSubscriptionTerms: vi.fn(),
  getSubscriptionTerms: vi.fn(),
  refresh: vi.fn(),
  registerGuard: vi.fn(),
  unregisterGuard: vi.fn(),
}));

const state = vi.hoisted(() => ({
  placingOrder: undefined as unknown as { value: boolean },
  subscribedItems: undefined as unknown as { value: { lineItemId: string }[] },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-1" },
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/shared/cart/composables", async () => {
  const { ref } = await import("vue");
  return { useFullCart: () => ({ availablePaymentMethods: ref([{ code: "card" }]) }) };
});

vi.mock("@/shared/checkout/composables/useCheckout", async () => {
  const { ref } = await import("vue");
  state.placingOrder = ref(false);
  return { useOrderPlacement: () => ({ placingOrder: state.placingOrder }) };
});

vi.mock("@/shared/checkout/composables/useCheckoutGuards", () => ({
  useCheckoutGuards: () => ({ registerGuard: h.registerGuard, unregisterGuard: h.unregisterGuard }),
}));

vi.mock("../api/graphql", () => ({
  acceptSubscriptionTerms: h.acceptSubscriptionTerms,
  getSubscriptionTerms: h.getSubscriptionTerms,
}));

vi.mock("../composables/useCartSubscriptions", async () => {
  const { computed, ref } = await import("vue");
  state.subscribedItems = ref([]);
  return {
    useCartSubscriptions: () => ({
      subscribedItems: state.subscribedItems,
      hasSubscriptionItems: computed(() => state.subscribedItems.value.length > 0),
      loading: ref(false),
      failed: ref(false),
      refresh: h.refresh,
    }),
  };
});

const cart = { id: "cart-1", items: [{ id: "line-1", name: "Coffee" }] } as unknown as CartType;
const cartWithoutSubscribedLine = { id: "cart-1", items: [{ id: "line-2", name: "Mug" }] } as unknown as CartType;

function mountTerms() {
  return mount(CheckoutSubscriptionTerms, {
    props: { cart },
    global: {
      stubs: {
        VcWidget: { template: "<div><slot /></div>" },
        VcAlert: { template: "<div><slot /></div>" },
        VcButton: true,
        VcLoader: true,
        VcCheckbox: { name: "VcCheckbox", props: ["modelValue"], template: "<input type='checkbox' />" },
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

async function tickTerms(wrapper: ReturnType<typeof mountTerms>) {
  wrapper.findComponent({ name: "VcCheckbox" }).vm.$emit("update:model-value", true);
  await flushPromises();
}

function storedRequirement() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as { consentId?: string; cartId?: string }) : undefined;
}

describe("CheckoutSubscriptionTerms: stored card-saving consent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    state.placingOrder.value = false;
    state.subscribedItems.value = [{ lineItemId: "line-1" }];
    h.getSubscriptionTerms.mockResolvedValue({ text: "Terms", version: "1", hash: "hash" });
    h.acceptSubscriptionTerms.mockResolvedValue("consent-1");
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("stores the consent when the terms are ticked", async () => {
    const wrapper = mountTerms();
    await flushPromises();

    await tickTerms(wrapper);

    expect(storedRequirement()).toMatchObject({ consentId: "consent-1", cartId: "cart-1" });
  });

  it("clears a consent stored earlier when the block mounts with the box unticked", async () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ consentId: "old", cartId: "cart-1", requiredAt: Date.now() }));

    mountTerms();
    await flushPromises();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clears the consent when the subscribed line leaves the cart and other lines stay", async () => {
    const wrapper = mountTerms();
    await flushPromises();
    await tickTerms(wrapper);

    await wrapper.setProps({ cart: cartWithoutSubscribedLine });
    state.subscribedItems.value = [];
    await flushPromises();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clears the consent when the subscribed line is turned one-time", async () => {
    const wrapper = mountTerms();
    await flushPromises();
    await tickTerms(wrapper);

    state.subscribedItems.value = [];
    await flushPromises();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("clears the consent when the block is dropped, e.g. the cart was left empty", async () => {
    const wrapper = mountTerms();
    await flushPromises();
    await tickTerms(wrapper);

    wrapper.unmount();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("asks again after going back to the cart and turning the subscription off (multi-step)", async () => {
    const review = mountTerms();
    await flushPromises();
    await tickTerms(review);

    // Back to the cart: the review page and its block go away, and the subscription is turned off there.
    review.unmount();
    state.subscribedItems.value = [];

    // Back to the review: nothing to consent to, and nothing stored.
    const again = mountTerms();
    await flushPromises();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(again.findComponent({ name: "VcCheckbox" }).exists()).toBe(false);
  });

  it("keeps the consent while an order is placed, so the order's payment step still reads it", async () => {
    const wrapper = mountTerms();
    await flushPromises();
    await tickTerms(wrapper);

    // Placing the order refetches the cart (no subscribed lines left) and then leaves the review page.
    state.placingOrder.value = true;
    state.subscribedItems.value = [];
    await flushPromises();
    wrapper.unmount();

    expect(storedRequirement()).toMatchObject({ consentId: "consent-1", cartId: "cart-1" });
  });

  it("clears the consent when the box is unticked", async () => {
    const wrapper = mountTerms();
    await flushPromises();
    await tickTerms(wrapper);

    wrapper.findComponent({ name: "VcCheckbox" }).vm.$emit("update:model-value", false);
    await flushPromises();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
