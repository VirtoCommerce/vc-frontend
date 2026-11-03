import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CartForLater from "./cart-for-later.vue";
import type { SavedForLaterListFragment } from "@/core/api/graphql/types";

function savedForLaterList(productIds: string[]): SavedForLaterListFragment {
  return {
    id: "list-1",
    name: "Saved for later",
    itemsQuantity: productIds.length,
    items: productIds.map((id) => ({ id: `line-${id}`, productId: id, product: { id } })),
  } as unknown as SavedForLaterListFragment;
}

function mountWidget(list: SavedForLaterListFragment) {
  return mount(CartForLater, {
    props: { savedForLaterList: list },
    global: {
      stubs: {
        VcWidget: { template: "<div><slot /></div>" },
        VcProductsGrid: { template: "<div><slot /></div>" },
        VcButton: true,
        CartItemForLater: true,
      },
      mocks: { $t: (key: string) => key },
    },
  });
}

describe("CartForLater", () => {
  it("emits a clicked product with its position in the list", () => {
    const wrapper = mountWidget(savedForLaterList(["p", "q"]));

    wrapper.findAllComponents({ name: "CartItemForLater" })[1].vm.$emit("linkClick");

    expect(wrapper.emitted("selectItem")).toEqual([[{ id: "q" }, 1]]);
  });
});
