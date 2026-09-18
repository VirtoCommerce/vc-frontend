import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import SelectAddressModal from "../select-address-modal.vue";
import type { AnyAddressType } from "@/core/types";
import type { VueWrapper } from "@vue/test-utils";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@vueuse/core")>();
  const { ref } = await import("vue");

  return {
    ...actual,
    useBreakpoints: () => ({ smaller: () => ref(false) }),
  };
});

const VcModalStub = defineComponent({
  name: "VcModal",

  setup(_, { slots }) {
    return () => h("div", [slots.default?.(), slots.actions?.({ close: () => {} })]);
  },
});

const VcTableStub = defineComponent({
  name: "VcTable",
  props: { items: { type: Array, default: () => [] } },

  setup(props, { slots }) {
    return () =>
      h("table", [
        h(
          "tbody",
          props.items.map((item) => slots["desktop-item"]?.({ item })),
        ),
      ]);
  },
});

const VcButtonStub = defineComponent({
  name: "VcButton",
  props: { disabled: { type: Boolean, default: false } },
  emits: { click: () => true },

  setup(props, { emit, slots }) {
    return () =>
      h("button", { type: "button", disabled: props.disabled, onClick: () => emit("click") }, slots.default?.());
  },
});

const VcIconStub = defineComponent({
  name: "VcIcon",
  props: { name: { type: String, default: "" } },

  setup(props) {
    return () => h("i", { "data-icon": props.name });
  },
});

const ADDRESSES: AnyAddressType[] = [
  { id: "addr-1", firstName: "Ada", lastName: "Lovelace", line1: "1 First St", city: "London" },
  { id: "addr-2", firstName: "Alan", lastName: "Turing", line1: "2 Second St", city: "Cambridge" },
];

function createComponent() {
  return mount(SelectAddressModal, {
    props: {
      addresses: ADDRESSES,
      isCorporateAddresses: false,
      allowAddNewAddress: false,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        VcModal: VcModalStub,
        VcTable: VcTableStub,
        VcButton: VcButtonStub,
        VcIcon: VcIconStub,
        VcAlert: true,
        VcBadge: true,
        VcPagination: true,
        VcInputDetails: true,
        SelectAddressFilter: true,
        PickupAvailabilityInfo: true,
      },
    },
  });
}

function rowFor(wrapper: VueWrapper, id: string) {
  return wrapper.get(`[data-test-id="customer-address-${id}"]`);
}

function confirmButton(wrapper: VueWrapper) {
  return wrapper.get('[data-test-id="confirm-button"]');
}

describe("SelectAddressModal", () => {
  it("selects an address when its row is clicked", async () => {
    const wrapper = createComponent();

    await rowFor(wrapper, "addr-2").trigger("click");

    expect(wrapper.emitted("result")).toBeUndefined();

    await confirmButton(wrapper).trigger("click");

    expect(wrapper.emitted("result")?.[0]).toEqual([ADDRESSES[1]]);
  });

  it.each([
    ["Enter", { key: "Enter" }],
    ["Space", { key: " " }],
  ])("selects an address when %s is pressed on its focused row", async (_label, event) => {
    const wrapper = createComponent();

    await rowFor(wrapper, "addr-2").trigger("keydown", event);
    await confirmButton(wrapper).trigger("click");

    expect(wrapper.emitted("result")?.[0]).toEqual([ADDRESSES[1]]);
  });

  it("exposes every row to keyboard users", () => {
    const wrapper = createComponent();

    for (const address of ADDRESSES) {
      expect(rowFor(wrapper, address.id!).attributes("tabindex")).toBe("0");
    }
  });
});
