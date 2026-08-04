import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { computed, ref } from "vue";
import CouponsSection from "../coupons-section.vue";

const mockTranslate = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}|${JSON.stringify(params)}` : key;

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mockTranslate, d: String }),
}));

const couponError = ref<{ code: string; type: string } | undefined>();
const applyCoupon = vi.fn(() => Promise.resolve(true));
const removeCoupon = vi.fn(() => Promise.resolve(true));
const cart = ref<{ discountTotal?: { formattedAmount: string }; total?: { formattedAmount: string } } | undefined>();

vi.mock("@/shared/cart", () => ({
  useCoupon: () => ({
    appliedCouponCode: computed(() => undefined),
    couponError,
    loadingCouponCode: computed(() => undefined),
    applyCoupon,
    removeCoupon,
  }),
  useFullCart: () => ({ cart }),
}));

vi.mock("@/shared/account", () => ({
  usePromotionCoupons: () => ({ coupons: computed(() => []) }),
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
    expect(text).toContain("$1,312.80");
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
    applyCoupon.mockImplementationOnce(() => {
      couponError.value = { code: "OTHER", type: "invalid" };
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

  it("does not break when the cart has no totals yet", async () => {
    cart.value = undefined;
    const wrapper = createComponent();

    wrapper.findComponent(COUPON_CARD).vm.$emit("apply", "ZUR10");
    await flushPromises();

    expect(wrapper.get(LIVE_REGION).text()).toContain("ZUR10");
  });
});
