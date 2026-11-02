import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ProceedTo from "./proceed-to.vue";
import VcButton from "@/ui-kit/components/molecules/button/vc-button.vue";

const { loadingCart, loadingCheckout } = vi.hoisted(() => ({
  loadingCart: { value: false },
  loadingCheckout: { value: false },
}));

vi.mock("@/shared/cart", () => ({
  useFullCart: () => ({
    loading: ref(loadingCart.value),
    changing: ref(false),
    hasValidationErrors: ref(false),
    hasLoyaltyValidationErrors: ref(false),
  }),
}));

vi.mock("@/shared/checkout/composables/useCheckout", () => ({
  useCheckout: () => ({
    loading: ref(loadingCheckout.value),
    changing: ref(false),
  }),
}));

function mountProceedTo(props: { loading?: boolean } = {}) {
  return mount(ProceedTo, {
    props: { testId: "proceed-to-button", ...props },
    slots: { default: "Place order" },
    global: { components: { VcButton }, stubs: { VcIcon: true } },
  });
}

describe("ProceedTo", () => {
  beforeEach(() => {
    loadingCart.value = false;
    loadingCheckout.value = false;
  });

  it.each([
    ["the cart", loadingCart],
    ["the checkout", loadingCheckout],
  ])("stays disabled with its label and no spinner while %s is loading", (_, source) => {
    source.value = true;

    const button = mountProceedTo().find('[data-test-id="proceed-to-button"]');

    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Place order");
    expect(button.classes()).not.toContain("vc-button--loading");
    expect(button.attributes("aria-busy")).toBeUndefined();
    expect(button.find(".vc-button__loader").exists()).toBe(false);
  });

  it("shows the spinner and aria-busy when the loading prop is set", () => {
    const button = mountProceedTo({ loading: true }).find('[data-test-id="proceed-to-button"]');

    expect(button.attributes("disabled")).toBeDefined();
    expect(button.classes()).toContain("vc-button--loading");
    expect(button.attributes("aria-busy")).toBe("true");
    expect(button.find(".vc-button__loader").exists()).toBe(true);
  });
});
