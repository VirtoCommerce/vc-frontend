import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, nextTick, ref } from "vue";
import CouponsSection from "../coupons-section.vue";

const mockTranslate = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}|${JSON.stringify(params)}` : key;

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mockTranslate, d: String }),
}));

const couponError = ref<{ code: string; type: string } | undefined>();
const appliedCouponCode = ref<string | undefined>();
// Success mirrors reality: the mutation returns the fresh cart, so the code becomes the applied one.
const applyCoupon = vi.fn((code: string) => {
  appliedCouponCode.value = code;
  return Promise.resolve(true);
});
const removeCoupon = vi.fn(() => {
  appliedCouponCode.value = undefined;
  return Promise.resolve(true);
});
const cart = ref<{ discountTotal?: { formattedAmount: string }; total?: { formattedAmount: string } } | undefined>();

const loadingCouponCode = ref<string | undefined>();

vi.mock("@/shared/cart", () => ({
  useCoupon: () => ({
    appliedCouponCode,
    couponError,
    loadingCouponCode,
    applyCoupon,
    removeCoupon,
  }),
  useFullCart: () => ({ cart }),
}));

const promotionCoupons = ref<{ id: string; couponCode: string }[]>([]);

vi.mock("@/shared/account", () => ({
  usePromotionCoupons: () => ({ coupons: computed(() => promotionCoupons.value) }),
  useUser: () => ({ isAuthenticated: computed(() => false) }),
}));

vi.mock("@/core/composables", () => ({ useModules: () => ({ hasModule: () => false }) }));

const LIVE_REGION = "[aria-live='polite']";

// Real CouponCard, so the emit -> handler wiring is exercised.
const COUPON_CARD = { name: "CouponCard" };

describe("CouponsSection", () => {
  const createComponent = () =>
    mount(CouponsSection, {
      global: {
        stubs: {
          VcWidget: { template: "<div><slot name='default-container' /></div>" },
          VcIcon: true,
          VcInput: true,
          VcButton: true,
          RouterLink: true,
        },
        mocks: { $t: mockTranslate },
      },
    });

  beforeEach(() => {
    couponError.value = undefined;
    appliedCouponCode.value = undefined;
    loadingCouponCode.value = undefined;
    promotionCoupons.value = [];
    cart.value = { discountTotal: { formattedAmount: "$50.00" }, total: { formattedAmount: "$1,312.80" } };
    applyCoupon.mockClear();
    removeCoupon.mockClear();
  });

  // VCST-5533: the new figures were not announced at all.
  it("exposes a polite, atomic live region", () => {
    const wrapper = createComponent();

    const region = wrapper.get(LIVE_REGION);
    expect(region.attributes("aria-atomic")).toBe("true");
    expect(region.classes()).toContain("sr-only");
  });

  it("starts empty so nothing is announced on load", () => {
    expect(createComponent().get(LIVE_REGION).text()).toBe("");
  });

  it("announces the code, discount and new total after a coupon is applied", async () => {
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "ZUR10");
    await flushPromises();

    const text = wrapper.get(LIVE_REGION).text();
    expect(applyCoupon).toHaveBeenCalledWith("ZUR10");
    expect(text).toContain("applied_announcement");
    expect(text).toContain("ZUR10");
    expect(text).toContain("$50.00");
    expect(text).toContain("$1,312.80");
  });

  it("announces the new total after a coupon is removed", async () => {
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("remove", "ZUR10");
    await flushPromises();

    const text = wrapper.get(LIVE_REGION).text();
    expect(removeCoupon).toHaveBeenCalledWith("ZUR10");
    expect(text).toContain("removed_announcement");
    expect(text).toContain("$50.00");
    expect(text).toContain("$1,312.80");
  });

  it("stays silent when the removal did not go through", async () => {
    removeCoupon.mockImplementationOnce(() => Promise.resolve(false));
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("remove", "ZUR10");
    await flushPromises();

    expect(wrapper.get(LIVE_REGION).text()).toBe("");
  });

  it("stays silent when applying the coupon failed", async () => {
    applyCoupon.mockImplementationOnce(() => Promise.resolve(false));
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "BAD");
    await flushPromises();

    expect(wrapper.get(LIVE_REGION).text()).toBe("");
  });

  // VCST-5533 / bugbot: `couponError` is module-level, so a concurrent operation on another card
  // could previously suppress this call's success or fabricate one for its failure.
  it("announces its own success even when a concurrent operation left the shared error set", async () => {
    applyCoupon.mockImplementationOnce((code: string) => {
      couponError.value = { code: "OTHER", type: "invalid" };
      appliedCouponCode.value = code;
      return Promise.resolve(true);
    });
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "ZUR10");
    await flushPromises();

    expect(wrapper.get(LIVE_REGION).text()).toContain("ZUR10");
  });

  it("stays silent on its own failure even when a concurrent operation cleared the shared error", async () => {
    applyCoupon.mockImplementationOnce(() => {
      couponError.value = undefined;
      return Promise.resolve(false);
    });
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "BAD");
    await flushPromises();

    expect(wrapper.get(LIVE_REGION).text()).toBe("");
  });

  // "Did it actually apply" lives in useCoupon (see useCoupon.test.ts); here the section trusts
  // the boolean and must voice both status changes of a successful swap.
  it("announces the removed previous coupon and the newly applied one on a successful swap", async () => {
    appliedCouponCode.value = "OLD10";
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "NEW20");
    await flushPromises();

    const text = wrapper.get(LIVE_REGION).text();
    expect(text).toContain("removed_announcement");
    expect(text).toContain("OLD10");
    expect(text).toContain("applied_announcement");
    expect(text).toContain("NEW20");
  });

  // A swap can remove the old coupon and still fail to apply the new one; the lost
  // discount must then be announced on its own.
  it("announces the removal of the previous coupon when a swap fails after removing it", async () => {
    appliedCouponCode.value = "OLD10";
    applyCoupon.mockImplementationOnce(() => {
      appliedCouponCode.value = undefined;
      return Promise.resolve(false);
    });
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "BAD");
    await flushPromises();

    const text = wrapper.get(LIVE_REGION).text();
    expect(text).toContain("removed_announcement");
    expect(text).toContain("OLD10");
    expect(text).toContain("$50.00");
    expect(text).toContain("$1,312.80");
  });

  it("stays silent about the previous coupon when the failed apply did not remove it", async () => {
    appliedCouponCode.value = "OLD10";
    applyCoupon.mockImplementationOnce(() => Promise.resolve(false));
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "BAD");
    await flushPromises();

    expect(wrapper.get(LIVE_REGION).text()).toBe("");
  });

  // `cart` being empty here is unreachable from the page (it renders only with a loaded cart);
  // if it ever happens, the figures sentence is dropped instead of reading out empty slots.
  it("announces without figures when the cart has no totals", async () => {
    cart.value = undefined;
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "ZUR10");
    await flushPromises();

    const text = wrapper.get(LIVE_REGION).text();
    expect(text).toContain("applied_announcement");
    expect(text).toContain("ZUR10");
    expect(text).not.toContain("totals_announcement");
  });

  // VCST-5533 / bugbot: the backend matches codes case-insensitively, so the card state must too —
  // otherwise the live region says "applied" while the card still offers Apply.
  it("marks a card whose code differs only in case from the applied one as applied", () => {
    promotionCoupons.value = [{ id: "1", couponCode: "SAVE10" }];
    appliedCouponCode.value = "save10";

    expect(createComponent().findAllComponents(COUPON_CARD)[0].props("view")).toBe("applied");
  });

  // Both halves matter: without the message the card looks errored but carries no text and no
  // `aria-invalid`/`aria-describedby` (see coupon-card.vue).
  it("marks a card whose code differs only in case from the failed one as errored", () => {
    promotionCoupons.value = [{ id: "1", couponCode: "SAVE10" }];
    couponError.value = { code: "save10", type: "invalid" };

    const card = createComponent().findAllComponents(COUPON_CARD)[0];

    expect(card.props("view")).toBe("error");
    expect(card.props("error")).toBe("common.messages.invalid_coupon");
  });

  // `loadingCouponCode` holds the trimmed code, while the custom field holds raw user input,
  // so the two only line up once both are normalized.
  it("keeps the custom card loading while its raw input is being applied", async () => {
    const wrapper = createComponent();
    const customCard = () => wrapper.findAllComponents(COUPON_CARD).at(-1)!;

    customCard().vm.$emit("update:modelValue", " Save10 ");
    loadingCouponCode.value = "save10";
    await nextTick();

    expect(customCard().props("loading")).toBe(true);
  });

  // A re-apply that differs only in case is not a swap: nothing was lost, so announcing a removal
  // would tell the user their discount is gone when it never went anywhere.
  it("does not announce a removal when the applied coupon is re-applied in a different case", async () => {
    appliedCouponCode.value = "SAVE10";
    applyCoupon.mockImplementationOnce(() => {
      appliedCouponCode.value = "save10";
      return Promise.resolve(true);
    });
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "save10");
    await flushPromises();

    const text = wrapper.get(LIVE_REGION).text();
    expect(text).toContain("applied_announcement");
    expect(text).not.toContain("removed_announcement");
  });
});
