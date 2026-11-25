import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { UPCOMING_DELIVERY_STATE } from "../constants";
import SubscriptionDelivery from "./subscription-delivery.vue";
import type { ProductSubscriptionFieldsFragment, RenewalFieldsFragment } from "../api/graphql/types";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
    te: () => true,
    d: (date: Date) => date.toISOString().slice(0, 10),
  }),
}));

vi.mock("@/core/utilities", () => ({
  getProductRoute: (id: string) => ({ name: "Product", params: { productId: id } }),
}));

vi.mock("../composables/useSubscriptionOffers", () => ({
  useSubscriptionOffers: () => ({ offerFor: () => undefined }),
}));

vi.mock("./subscription-configuration.vue", () => ({ default: { template: "<div />" } }));
vi.mock("./subscription-item-menu.vue", async () => {
  const { defineComponent } = await import("vue");
  return {
    default: defineComponent({
      name: "SubscriptionItemMenu",
      props: ["subscriptions", "canSkip", "canOrderNow", "disabled", "testId"],
      template: "<div />",
    }),
  };
});

function subscription(id: string): ProductSubscriptionFieldsFragment {
  return { id, number: `S-${id}`, canOrderNow: true } as ProductSubscriptionFieldsFragment;
}

function renewal(state: string, overrides: Partial<RenewalFieldsFragment> = {}): RenewalFieldsFragment {
  return {
    id: "r-1",
    number: "R-1",
    state,
    scheduledDate: "2026-12-01T00:00:00Z",
    items: [
      { subscriptionId: "a", productId: "product-a", quantity: 1 },
      { subscriptionId: "b", productId: "product-b", quantity: 1 },
    ],
    ...overrides,
  } as RenewalFieldsFragment;
}

function mountDelivery(
  props: Partial<InstanceType<typeof SubscriptionDelivery>["$props"]> & { renewal: RenewalFieldsFragment },
) {
  return mount(SubscriptionDelivery, {
    props: { subscriptionsById: { a: subscription("a"), b: subscription("b") }, ...props },
    global: {
      stubs: {
        VcWidget: { template: "<div><slot name='append' /><slot /><slot name='footer' /></div>" },
        VcAlert: { template: "<div><slot /></div>" },
        VcLink: { name: "VcLink", props: ["to"], template: "<a><slot /></a>" },
        VcShape: true,
        VcBadge: true,
        VcButton: true,
        VcPriceDisplay: true,
        VcLineItems: true,
      },
      mocks: {
        $t: (key: string, params?: Record<string, unknown>) => `${key} ${JSON.stringify(params ?? {})}`,
        $d: () => "",
      },
    },
  });
}

describe("SubscriptionDelivery", () => {
  describe("order now", () => {
    it("leaves out a subscription whose last order still waits for its payment", async () => {
      const wrapper = mountDelivery({ renewal: renewal(UPCOMING_DELIVERY_STATE), awaitingPaymentIds: ["a"] });
      const menu = wrapper.findComponent({ name: "SubscriptionItemMenu" });

      expect(menu.props("canOrderNow")).toBe(true);
      menu.vm.$emit("orderNow", [subscription("a"), subscription("b")]);
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("orderNow")?.[0]).toEqual([[subscription("b")]]);
    });

    it("isn't offered when every subscription of the delivery waits for a payment", () => {
      const wrapper = mountDelivery({ renewal: renewal(UPCOMING_DELIVERY_STATE), awaitingPaymentIds: ["a", "b"] });

      expect(wrapper.findComponent({ name: "SubscriptionItemMenu" }).props("canOrderNow")).toBe(false);
    });
  });

  it("says when a declined payment is retried", () => {
    const wrapper = mountDelivery({
      renewal: renewal("RetryScheduled", { nextAttemptDate: "2026-12-03T10:00:00Z", lastErrorCode: "CARD_DECLINED" }),
    });

    expect(wrapper.find("[data-test-id='subscription-delivery-issue']").text()).toContain(
      'product_subscriptions.renewal.messages.retry {"date":"2026-12-03"}',
    );
  });

  it("links an ordered delivery to its order", () => {
    const wrapper = mountDelivery({ renewal: renewal("Ordered", { orderId: "order-1", orderNumber: "CO-1" }) });
    const link = wrapper.findComponent({ name: "VcLink" });

    expect(link.props("to")).toEqual({ name: "OrderDetails", params: { orderId: "order-1" } });
    expect(link.text()).toContain('"number":"CO-1"');
  });

  it("has no order link before the order is placed", () => {
    const wrapper = mountDelivery({ renewal: renewal("Notified") });

    expect(wrapper.find("[data-test-id='subscription-delivery-order-link']").exists()).toBe(false);
  });
});
