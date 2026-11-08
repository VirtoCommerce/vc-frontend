import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCardPaymentMethods, getSavedPaymentMethods } from "@/shared/payment/api/graphql";
import PaymentMethodsPage from "./payment-methods.vue";

vi.mock("@/shared/payment/api/graphql", () => ({
  getSavedPaymentMethods: vi.fn(),
  getCardPaymentMethods: vi.fn(),
  removeSavedPaymentMethod: vi.fn(),
  setDefaultSavedPaymentMethod: vi.fn(),
}));

vi.mock("@/shared/payment/components/add-card-authorize-net.vue", () => ({ default: {} }));

vi.mock("@/core/composables", () => ({ usePageHead: vi.fn() }));

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));

vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ success: vi.fn(), error: vi.fn() }) }));

vi.mock("@/shared/common/composables/extensionRegistry/useExtensionRegistry", () => ({
  useExtensionRegistry: () => ({ canRender: () => false }),
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

enableAutoUnmount(afterEach);

function mountPage() {
  return mount(PaymentMethodsPage, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        VcTypography: { template: "<h1><slot /></h1>" },
        VcWidget: { template: "<section><slot name='default-container' /><slot /></section>" },
        VcAlert: { template: "<div role='alert'><slot /></div>" },
        VcButton: { template: "<button type='button'><slot /></button>" },
        VcEmptyView: { props: ["text"], template: "<p>{{ text }}</p>" },
        VcLoaderOverlay: true,
        VcConfirmationModal: true,
        VcCheckbox: true,
        VcRadioButton: true,
        ExtensionPoint: true,
      },
    },
  });
}

describe("payment methods page", () => {
  beforeEach(() => {
    vi.mocked(getCardPaymentMethods).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows an error with a retry instead of the empty view when the cards fail to load", async () => {
    vi.mocked(getSavedPaymentMethods).mockRejectedValue(new Error("network"));

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.find('[data-test-id="payment-methods-load-error"]').text()).toContain(
      "shared.payment.saved_cards.load_failed",
    );
    expect(wrapper.text()).not.toContain("shared.payment.saved_cards.empty");

    vi.mocked(getSavedPaymentMethods).mockResolvedValue([]);
    await wrapper.find('[data-test-id="payment-methods-retry"]').trigger("click");
    await flushPromises();

    expect(getSavedPaymentMethods).toHaveBeenCalledTimes(2);
    expect(wrapper.find('[data-test-id="payment-methods-load-error"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("shared.payment.saved_cards.empty");
  });

  it("shows an error with a retry in place of the add-card form when the card forms fail to load", async () => {
    vi.mocked(getSavedPaymentMethods).mockResolvedValue([]);
    vi.mocked(getCardPaymentMethods).mockRejectedValue(new Error("network"));

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.find('[data-test-id="payment-methods-forms-error"]').text()).toContain(
      "shared.payment.saved_cards.forms_load_failed",
    );

    await wrapper.find('[data-test-id="payment-methods-forms-retry"]').trigger("click");
    await flushPromises();

    expect(getCardPaymentMethods).toHaveBeenCalledTimes(2);
  });
});
