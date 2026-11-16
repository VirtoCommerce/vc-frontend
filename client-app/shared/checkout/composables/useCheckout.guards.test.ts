import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref } from "vue";
import { createOrderFromCart as createOrderFromCartApi } from "@/core/api/graphql";
import { _useCheckout } from "./useCheckout";
import { useCheckoutGuards } from "./useCheckoutGuards";

const h = vi.hoisted(() => ({
  updatePayment: vi.fn(),
  error: vi.fn(),
}));

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key, te: () => false }) }));

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/core/api/graphql", () => ({ createOrderFromCart: vi.fn() }));

vi.mock("@/core/composables", async () => {
  const { ref: vueRef } = await import("vue");
  return {
    useAnalytics: () => ({ analytics: vi.fn() }),
    useHistoricalEvents: () => ({ pushHistoricalEvent: vi.fn() }),
    useThemeContext: () => ({ themeContext: vueRef({ settings: {}, storeSettings: {} }) }),
  };
});

vi.mock("@/core/utilities", () => ({
  Logger: { error: vi.fn(), warn: vi.fn() },
  isEqualAddresses: () => false,
}));

vi.mock("@/shared/account", async () => {
  const { ref: vueRef } = await import("vue");
  const addresses = () => ({
    addresses: vueRef([]),
    loading: vueRef(false),
    totalCount: vueRef(0),
    page: vueRef(1),
    keyword: vueRef(""),
    filterCountryCodes: vueRef([]),
    filterRegionIds: vueRef([]),
    filterCities: vueRef([]),
    termFacets: vueRef([]),
    sort: vueRef(),
    addOrUpdateAddresses: vi.fn(),
  });
  return {
    useUser: () => ({ user: vueRef({}), isAuthenticated: vueRef(false), isCorporateMember: vueRef(false) }),
    useCustomerAddresses: addresses,
  };
});

vi.mock("@/shared/company", async () => {
  const { ref: vueRef } = await import("vue");
  return {
    useCurrentOrganizationAddresses: () => ({
      addresses: vueRef([]),
      loading: vueRef(false),
      totalCount: vueRef(0),
      page: vueRef(1),
      keyword: vueRef(""),
      filterCountryCodes: vueRef([]),
      filterRegionIds: vueRef([]),
      filterCities: vueRef([]),
      termFacets: vueRef([]),
      sort: vueRef(),
      addOrUpdateAddresses: vi.fn(),
    }),
  };
});

vi.mock("@/shared/cart", async () => {
  const { ref: vueRef } = await import("vue");
  return {
    EXTENDED_DEBOUNCE_IN_MS: 0,
    getLoyaltyValidationMessages: () => [],
    useFullCart: () => ({
      refetch: vi.fn(),
      cart: vueRef({ id: "cart-1", total: { amount: 10 }, items: [] }),
      selectedLineItems: vueRef([]),
      selectCartItems: vi.fn(),
      shipment: vueRef({ id: "shipment-1", deliveryAddress: {} }),
      payment: vueRef({ id: "payment-1" }),
      availableShippingMethods: vueRef([]),
      availablePaymentMethods: vueRef([]),
      hasValidationErrors: vueRef(false),
      loyaltyValidationErrors: vueRef([]),
      hasLoyaltyValidationErrors: vueRef(false),
      allItemsAreDigital: vueRef(true),
      updateShipment: vi.fn(),
      removeShipment: vi.fn(),
      updatePayment: h.updatePayment,
      changeComment: vi.fn(),
      updatePurchaseOrderNumber: vi.fn(),
    }),
  };
});

vi.mock("@/shared/modal", () => ({ useModal: () => ({ openModal: vi.fn(), closeModal: vi.fn() }) }));

vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: h.error }) }));

vi.mock("@/shared/payment", () => ({
  PaymentMethodGroupType: { 0: "Manual", Manual: 0 },
  usePayment: () => ({ finalizePayment: vi.fn() }),
}));

vi.mock("@/shared/account/components/add-or-update-address-modal.vue", () => ({ default: {} }));
vi.mock("@/shared/checkout/components/select-address-modal.vue", () => ({ default: {} }));

// The Place order button is not the only way in: order creation itself refuses while a module guard blocks.
describe("useCheckout: createOrderFromCart and checkout guards", () => {
  const scope = effectScope(true);
  const { registerGuard, unregisterGuard } = useCheckoutGuards();
  const checkout = scope.run(() => _useCheckout())!;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createOrderFromCartApi).mockResolvedValue(null as never);
  });

  afterEach(() => {
    unregisterGuard("test");
  });

  it("creates no order while a guard blocks", async () => {
    const allowed = ref(false);
    registerGuard("test", { canPlaceOrder: allowed });

    expect(await checkout.createOrderFromCart()).toBeNull();
    expect(h.updatePayment).not.toHaveBeenCalled();
    expect(createOrderFromCartApi).not.toHaveBeenCalled();
  });

  it("goes on to create the order once the guard allows it", async () => {
    const allowed = ref(false);
    registerGuard("test", { canPlaceOrder: allowed });
    allowed.value = true;

    await checkout.createOrderFromCart();

    expect(createOrderFromCartApi).toHaveBeenCalledWith("cart-1");
  });
});
