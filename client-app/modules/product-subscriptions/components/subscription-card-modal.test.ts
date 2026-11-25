import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubscriptionCardModal from "./subscription-card-modal.vue";

const h = vi.hoisted(() => ({
  getSavedPaymentMethods: vi.fn(),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/core/api/graphql", () => ({
  getSavedPaymentMethods: h.getSavedPaymentMethods,
}));

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn() },
}));

const card = {
  id: "card-1",
  brand: "Visa",
  last4: "4242",
  expirationMonth: 12,
  expirationYear: 2030,
  status: "Active",
  isExpired: false,
};

function mountModal() {
  return mount(SubscriptionCardModal, {
    props: { products: ["Coffee"], currentCardId: "card-1", onSave: vi.fn() },
    global: {
      stubs: {
        VcModal: { template: "<div><slot /><slot name='actions' :close='() => {}' /></div>" },
        VcAlert: { template: "<div><slot /></div>" },
        VcButton: { template: "<button><slot /></button>" },
        VcSelect: { name: "VcSelect", props: ["modelValue", "items"], template: "<div />" },
        VcList: true,
        VcListItem: true,
        RouterLink: true,
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("SubscriptionCardModal", () => {
  enableAutoUnmount(afterEach);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a load error with a retry instead of the no-cards message when the cards fail to load", async () => {
    h.getSavedPaymentMethods.mockRejectedValueOnce(new Error("network"));
    const wrapper = mountModal();
    await flushPromises();

    expect(wrapper.find("[data-test-id='subscription-card-modal-load-error']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("product_subscriptions.deliveries.no_cards");
  });

  it("lists the cards and preselects the one in use after a retry", async () => {
    h.getSavedPaymentMethods.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce([card]);
    const wrapper = mountModal();
    await flushPromises();

    await wrapper.get("[data-test-id='subscription-card-modal-retry-button']").trigger("click");
    await flushPromises();

    expect(wrapper.find("[data-test-id='subscription-card-modal-load-error']").exists()).toBe(false);
    const select = wrapper.getComponent({ name: "VcSelect" });
    expect(select.props("items")).toEqual([expect.objectContaining({ id: "card-1" })]);
    expect(select.props("modelValue")).toBe("card-1");
  });

  it("says there are no saved cards when the customer has none", async () => {
    h.getSavedPaymentMethods.mockResolvedValueOnce([]);
    const wrapper = mountModal();
    await flushPromises();

    expect(wrapper.text()).toContain("product_subscriptions.deliveries.no_cards");
    expect(wrapper.find("[data-test-id='subscription-card-modal-load-error']").exists()).toBe(false);
  });
});
