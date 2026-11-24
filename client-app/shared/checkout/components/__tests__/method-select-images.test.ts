import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, defineComponent, h, ref } from "vue";
import BillingDetailsSection from "../billing-details-section.vue";
import ShippingDetailsSection from "../shipping-details-section.vue";

const { SHIPPING_METHOD, PAYMENT_METHOD } = vi.hoisted(() => ({
  SHIPPING_METHOD: { id: "FixedRate_Ground", code: "FixedRate", optionName: "Ground", logoUrl: "ground.svg" },
  PAYMENT_METHOD: { code: "CyberSourcePaymentMethod", name: "CyberSource", logoUrl: "cybersource.svg" },
}));

vi.mock("@/shared/account", () => ({ useUser: () => ({ isAuthenticated: ref(true) }) }));
vi.mock("@/shared/account/composables/useUser", () => ({ useUser: () => ({ isAuthenticated: ref(true) }) }));

vi.mock("@/shared/cart", () => ({
  useFullCart: () => ({
    cart: ref({}),
    allItemsAreDigital: ref(false),
    availableShippingMethods: ref([SHIPPING_METHOD]),
    availablePaymentMethods: ref([PAYMENT_METHOD]),
    updateShipment: vi.fn(),
    shipment: ref(undefined),
    changing: ref(false),
  }),
}));

vi.mock("@/shared/checkout/composables/useCheckout", () => ({
  useCheckout: () => ({
    deliveryAddress: ref(undefined),
    shipmentMethod: ref(undefined),
    onDeliveryAddressChange: vi.fn(),
    billingAddressEqualsShipping: ref(true),
    billingAddress: ref(undefined),
    paymentMethod: ref(undefined),
    canPayFromCart: ref(false),
    onBillingAddressChange: vi.fn(),
    setPaymentMethod: vi.fn(),
    isPurchaseOrderNumberEnabled: ref(false),
    purchaseOrderNumber: ref(""),
    initialized: ref(false),
  }),
}));

vi.mock("@/shared/checkout/composables/useBopis", () => ({
  BOPIS_CODE: "BuyOnlinePickupInStore",
  useBopis: () => ({
    hasBOPIS: computed(() => false),
    openSelectAddressModal: vi.fn(),
    loading: ref(false),
    modalOpening: ref(false),
    bopisMethod: computed(() => undefined),
  }),
}));

vi.mock("@/shared/ship-to-location/composables/useShipToLocation", () => ({
  useShipToLocation: () => ({ selectedAddress: ref(undefined) }),
}));

vi.mock("@/shared/x-pickup/composables/useXPickup", () => ({
  useXPickup: () => ({ xPickupEnabled: ref(false) }),
}));

vi.mock("@/shared/common/components", async () => {
  const vue = await import("vue");
  return { AddressSelection: vue.defineComponent({ setup: () => () => vue.h("div") }) };
});

vi.mock("@/shared/common", async () => {
  const vue = await import("vue");
  return { AddressSelection: vue.defineComponent({ setup: () => () => vue.h("div") }) };
});

vi.mock("@/shared/payment/components/payment.vue", async () => {
  const vue = await import("vue");
  return { default: vue.defineComponent({ setup: () => () => null }) };
});

// Renders every slot VcSelect exposes, so the placeholder, the selected item and the list item are all in the DOM.
const VcSelectStub = defineComponent({
  name: "VcSelect",
  props: { items: { type: Array, default: () => [] } },

  setup(props, { slots }) {
    return () =>
      h("div", [
        slots.placeholder?.({ error: false }),
        ...props.items.map((item) => slots.selected?.({ item, error: false })),
        ...props.items.map((item) => slots.item?.({ item })),
      ]);
  },
});

// Mirrors VcImage: alt is rendered only when the consumer passes it.
const VcImageStub = defineComponent({
  name: "VcImage",
  props: { src: { type: String, default: "" }, alt: { type: String, default: undefined } },

  setup(props) {
    return () => h("img", { src: props.src, alt: props.alt });
  },
});

const PassThrough = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h("div", slots.default?.()),
});

function mountSection(component: typeof ShippingDetailsSection) {
  return mount(component, {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        VcSelect: VcSelectStub,
        VcImage: VcImageStub,
        VcWidget: PassThrough,
        VcLabel: PassThrough,
        VcTabSwitch: true,
        VcCheckbox: true,
        VcInput: true,
        VcButton: true,
        VcAlert: true,
        VcIcon: true,
      },
    },
  });
}

describe("checkout method selectors", () => {
  it.each([
    ["shipping", ShippingDetailsSection],
    ["billing", BillingDetailsSection],
  ])("give every %s method image an alt attribute", (_, component) => {
    const images = mountSection(component).findAll("img");

    expect(images.length).toBeGreaterThanOrEqual(3);
    images.forEach((image) => expect(image.attributes()).toHaveProperty("alt"));
  });
});
