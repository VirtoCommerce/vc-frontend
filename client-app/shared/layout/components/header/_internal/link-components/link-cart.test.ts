import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import LinkCart from "./link-cart.vue";

const cart = ref<{ itemsQuantity: number }>();

vi.mock("@/shared/cart", () => ({ useShortCart: () => ({ cart }) }));

const VcTooltip = {
  props: ["disabled"],
  template: '<div><slot name="trigger" /><div data-test-id="tooltip-content"><slot name="content" /></div></div>',
};

function mountLink(itemsQuantity: number) {
  cart.value = { itemsQuantity };

  return mount(LinkCart, {
    props: { item: { id: "cart", title: "Cart" } },
    global: {
      stubs: { VcTooltip, BottomHeaderLink: true },
      mocks: {
        $t: (key: string, params: Record<string, unknown>) => `${key} ${JSON.stringify(params)}`,
        $n: (value: number) => String(value),
      },
    },
  });
}

beforeEach(() => {
  cart.value = undefined;
});

describe("LinkCart tooltip", () => {
  it("stays off while the badge still shows the exact number", () => {
    expect(mountLink(99).findComponent(VcTooltip).props("disabled")).toBe(true);
  });

  it("turns on with the exact count once the badge is capped at 99+", () => {
    const wrapper = mountLink(100);

    expect(wrapper.findComponent(VcTooltip).props("disabled")).toBe(false);
    expect(wrapper.get('[data-test-id="tooltip-content"]').text()).toBe(
      'shared.layout.header.cart_items_tooltip {"n":"100"}',
    );
  });
});
