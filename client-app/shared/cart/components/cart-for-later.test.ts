import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import CartForLater from "./cart-for-later.vue";
import type { SavedForLaterListFragment } from "@/core/api/graphql/types";

const analytics = vi.hoisted(() => vi.fn());

vi.mock("@/core/composables/useAnalytics", () => ({
  useAnalytics: () => ({ analytics }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const LIST_PROPERTIES = { item_list_id: "saved_for_later", item_list_name: "pages.cart.saved_for_later" };

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

describe("CartForLater analytics", () => {
  beforeEach(() => {
    analytics.mockClear();
  });

  it("reports its own list and sends a selected product with its position in it", () => {
    const wrapper = mountWidget(savedForLaterList(["p", "q"]));

    wrapper.findAllComponents({ name: "CartItemForLater" })[1].vm.$emit("linkClick");

    expect(analytics.mock.calls).toEqual([
      ["viewItemList", [{ id: "p" }, { id: "q" }], LIST_PROPERTIES],
      ["selectItem", { id: "q" }, { ...LIST_PROPERTIES, index: 1 }],
    ]);
  });

  it("reports the list again only when its lines change", async () => {
    const wrapper = mountWidget(savedForLaterList(["p", "q"]));

    await wrapper.setProps({ savedForLaterList: savedForLaterList(["p", "q"]) });
    await wrapper.setProps({ savedForLaterList: savedForLaterList(["q"]) });
    await nextTick();

    expect(analytics.mock.calls).toEqual([
      ["viewItemList", [{ id: "p" }, { id: "q" }], LIST_PROPERTIES],
      ["viewItemList", [{ id: "q" }], LIST_PROPERTIES],
    ]);
  });
});
