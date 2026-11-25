import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubscriptionsPage from "./subscriptions.vue";
import type { ProductSubscriptionFieldsFragment, RenewalFieldsFragment } from "../api/graphql/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const h = vi.hoisted(() => ({
  getProductSubscriptions: vi.fn(),
  getSubscriptionRenewals: vi.fn(),
  orderProductSubscriptionNow: vi.fn(),
  pauseProductSubscription: vi.fn(),
  openModal: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}));

vi.mock("vue-i18n", async () => {
  const { ref } = await import("vue");
  return {
    useI18n: () => ({
      t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${JSON.stringify(params)}` : key),
      d: (date: Date) => date.toISOString(),
      n: (amount: number) => String(amount),
      locale: ref("en"),
    }),
  };
});

vi.mock("vue-router", () => ({ useRoute: () => ({ query: {} }) }));

vi.mock("@/core/composables", async () => {
  const { ref } = await import("vue");
  return { useCurrency: () => ({ currentCurrency: ref({ code: "USD" }) }), usePageHead: vi.fn() };
});

vi.mock("@/core/utilities", async () => {
  const { toLocalDateOnly } = await vi.importActual<typeof import("@/core/utilities/date")>("@/core/utilities/date");
  return {
    Logger: { error: vi.fn(), warn: vi.fn() },
    getProductRoute: (id: string) => ({ name: "Product", params: { productId: id } }),
    toLocalDateOnly,
  };
});

vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: h.openModal }) }));

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({ success: h.success, warning: h.warning, error: h.error }),
}));

vi.mock("../api/graphql", () => ({
  acceptSubscriptionRenewal: vi.fn(),
  cancelProductSubscription: vi.fn(),
  changeProductSubscription: vi.fn(),
  getProductSubscriptions: h.getProductSubscriptions,
  getSubscriptionRenewals: h.getSubscriptionRenewals,
  orderProductSubscriptionNow: h.orderProductSubscriptionNow,
  pauseProductSubscription: h.pauseProductSubscription,
  resumeProductSubscription: vi.fn(),
  retrySubscriptionRenewalPayment: vi.fn(),
  skipProductSubscription: vi.fn(),
  skipSubscriptionRenewal: vi.fn(),
}));

vi.mock("../composables/useSubscriptionOffers", () => ({
  useSubscriptionOffers: () => ({ loadOffers: vi.fn(), offerFor: () => undefined }),
}));

vi.mock("../components/purchase-options-modal.vue", () => ({ default: {} }));
vi.mock("../components/subscription-card-modal.vue", () => ({ default: {} }));
vi.mock("../components/subscription-confirm-modal.vue", () => ({ default: {} }));
vi.mock("../components/subscription-delivery.vue", async () => {
  const { defineComponent } = await import("vue");
  return {
    default: defineComponent({
      name: "SubscriptionDelivery",
      props: ["renewal", "subscriptionsById", "isNext", "busy", "busySubscriptions", "awaitingPaymentIds"],
      template: "<div />",
    }),
  };
});

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

function subscription(id: string, overrides: Partial<ProductSubscriptionFieldsFragment> = {}) {
  return {
    id,
    number: `S-${id}`,
    status: "Active",
    productId: `product-${id}`,
    productName: `Product ${id}`,
    quantity: 1,
    intervalUnit: "MONTH",
    intervalCount: 1,
    nextOrderDate: daysFromNow(30),
    currency: "USD",
    canSkip: true,
    canOrderNow: true,
    ...overrides,
  } as ProductSubscriptionFieldsFragment;
}

function renewal(id: string, state: string, scheduledDate: string, subscriptionIds: string[], overrides = {}) {
  return {
    id,
    number: `R-${id}`,
    state,
    scheduledDate,
    items: subscriptionIds.map((subscriptionId) => ({ subscriptionId, productId: `product-${subscriptionId}` })),
    ...overrides,
  } as unknown as RenewalFieldsFragment;
}

interface IServerType {
  subscriptions: ProductSubscriptionFieldsFragment[];
  open?: RenewalFieldsFragment[];
  recent?: RenewalFieldsFragment[];
  lastBySubscription?: Record<string, RenewalFieldsFragment>;
}

function serve({ subscriptions, open = [], recent = [], lastBySubscription = {} }: IServerType) {
  h.getProductSubscriptions.mockResolvedValue({ totalCount: subscriptions.length, items: subscriptions });
  h.getSubscriptionRenewals.mockImplementation((variables: { onlyOpen?: boolean; subscriptionId?: string }) => {
    if (variables.onlyOpen) {
      return Promise.resolve({ totalCount: open.length, items: open });
    }
    if (variables.subscriptionId) {
      const last = lastBySubscription[variables.subscriptionId];
      return Promise.resolve({ totalCount: last ? 1 : 0, items: last ? [last] : [] });
    }
    return Promise.resolve({ totalCount: recent.length, items: recent });
  });
}

async function mountPage() {
  const wrapper = mount(SubscriptionsPage, {
    global: {
      stubs: {
        VcTypography: true,
        VcWidget: true,
        VcLoaderOverlay: true,
        VcAlert: true,
        VcButton: true,
        VcEmptyView: true,
        VcLineItems: true,
        VcBadge: true,
      },
      mocks: { $t: (key: string) => key, $d: () => "" },
    },
  });
  await flushPromises();
  return wrapper;
}

function deliveries(wrapper: Awaited<ReturnType<typeof mountPage>>) {
  return wrapper.findAllComponents({ name: "SubscriptionDelivery" });
}

async function orderNow(wrapper: Awaited<ReturnType<typeof mountPage>>, targets: ProductSubscriptionFieldsFragment[]) {
  deliveries(wrapper)[0].vm.$emit("orderNow", targets);
  await flushPromises();
  return (h.openModal.mock.lastCall?.[0] as { props: { onConfirm: () => Promise<void> } }).props.onConfirm;
}

describe("subscriptions page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deliveries", () => {
    it("keeps a past-due subscription on the page by its failed renewal, however old it is", async () => {
      const failed = renewal("failed", "Failed", daysFromNow(-30), ["a"], { canRetryPayment: true });
      serve({ subscriptions: [subscription("a", { status: "PastDue" })], lastBySubscription: { a: failed } });

      const wrapper = await mountPage();

      expect(deliveries(wrapper).map((x) => x.props("renewal").id)).toEqual(["failed"]);
    });

    it("drops an ordered delivery older than two weeks", async () => {
      const ordered = renewal("ordered", "Authorized", daysFromNow(-20), ["a"]);
      serve({ subscriptions: [subscription("a")], open: [ordered] });

      const wrapper = await mountPage();

      expect(deliveries(wrapper).map((x) => x.props("renewal").id)).not.toContain("ordered");
    });

    it("marks the first delivery dated today or later as the next one, not a past one", async () => {
      const ordered = renewal("ordered", "Authorized", daysFromNow(-5), ["a"]);
      serve({
        subscriptions: [subscription("a"), subscription("b", { nextOrderDate: daysFromNow(10) })],
        open: [ordered],
      });

      const wrapper = await mountPage();

      const [past, upcoming] = deliveries(wrapper);
      expect(past.props("renewal").id).toBe("ordered");
      expect(past.props("isNext")).toBe(false);
      expect(upcoming.props("isNext")).toBe(true);
    });

    it("passes the subscriptions whose last order still waits for its payment", async () => {
      serve({
        subscriptions: [subscription("a"), subscription("b"), subscription("c")],
        open: [
          renewal("ordered", "Ordered", daysFromNow(-20), ["a"]),
          renewal("retry", "RetryScheduled", daysFromNow(-2), ["b"]),
          renewal("authorized", "Authorized", daysFromNow(-1), ["c"]),
        ],
      });

      const wrapper = await mountPage();

      expect(deliveries(wrapper)[0].props("awaitingPaymentIds")).toEqual(["a", "b"]);
    });
  });

  describe("order now", () => {
    const a = subscription("a");
    const b = subscription("b");

    beforeEach(() => {
      serve({ subscriptions: [a, b] });
    });

    it("says the order is placed when every order went through", async () => {
      h.orderProductSubscriptionNow.mockImplementation(({ subscriptionId }: { subscriptionId: string }) =>
        Promise.resolve(renewal(`r-${subscriptionId}`, "Authorized", daysFromNow(0), [subscriptionId])),
      );
      const wrapper = await mountPage();

      await (
        await orderNow(wrapper, [a, b])
      )();

      expect(h.orderProductSubscriptionNow).toHaveBeenCalledTimes(2);
      expect(h.success).toHaveBeenCalledWith(
        expect.objectContaining({ text: "product_subscriptions.deliveries.ordered" }),
      );
    });

    it("warns instead of reporting success when an order needs the customer", async () => {
      h.orderProductSubscriptionNow.mockResolvedValue(renewal("r-a", "PaymentActionRequired", daysFromNow(0), ["a"]));
      const wrapper = await mountPage();

      await (
        await orderNow(wrapper, [a])
      )();

      expect(h.success).not.toHaveBeenCalled();
      expect(h.warning).toHaveBeenCalledWith(
        expect.objectContaining({ text: "product_subscriptions.deliveries.ordered_needs_action" }),
      );
    });

    it("orders a prepared delivery once, for all its subscriptions", async () => {
      h.orderProductSubscriptionNow.mockResolvedValue(renewal("r-ab", "Authorized", daysFromNow(0), ["a", "b"]));
      const wrapper = await mountPage();

      await (
        await orderNow(wrapper, [a, b])
      )();

      expect(h.orderProductSubscriptionNow).toHaveBeenCalledTimes(1);
      expect(h.success).toHaveBeenCalled();
    });

    it("keeps going past a failed order, reloads the page and names the product that failed", async () => {
      h.orderProductSubscriptionNow
        .mockRejectedValueOnce(new Error("declined"))
        .mockResolvedValueOnce(renewal("r-b", "Authorized", daysFromNow(0), ["b"]));
      const wrapper = await mountPage();
      h.getProductSubscriptions.mockClear();

      await expect((await orderNow(wrapper, [a, b]))()).resolves.toBeUndefined();

      expect(h.orderProductSubscriptionNow).toHaveBeenCalledTimes(2);
      expect(h.getProductSubscriptions).toHaveBeenCalled();
      expect(h.success).not.toHaveBeenCalled();
      expect(h.error).toHaveBeenCalledWith(
        expect.objectContaining({ text: expect.stringContaining('"products":"Product a"') as string }),
      );
    });

    it("keeps the error in the dialog when every order failed, after reloading the page", async () => {
      const declined = new Error("declined");
      h.orderProductSubscriptionNow.mockRejectedValue(declined);
      const wrapper = await mountPage();
      h.getProductSubscriptions.mockClear();

      await expect((await orderNow(wrapper, [a, b]))()).rejects.toBe(declined);

      expect(h.getProductSubscriptions).toHaveBeenCalled();
      expect(h.error).not.toHaveBeenCalled();
    });
  });

  it("pauses the other products when one of them fails", async () => {
    const a = subscription("a", { canPause: true });
    const b = subscription("b", { canPause: true });
    serve({ subscriptions: [a, b] });
    h.pauseProductSubscription.mockRejectedValueOnce(new Error("refused")).mockResolvedValueOnce({});
    const wrapper = await mountPage();

    deliveries(wrapper)[0].vm.$emit("pause", [a, b]);
    await flushPromises();
    const { onConfirm } = (h.openModal.mock.lastCall?.[0] as { props: { onConfirm: () => Promise<void> } }).props;
    await onConfirm();

    expect(h.pauseProductSubscription).toHaveBeenCalledTimes(2);
    expect(h.error).toHaveBeenCalledWith(
      expect.objectContaining({ text: expect.stringContaining('"products":"Product a"') as string }),
    );
  });
});
