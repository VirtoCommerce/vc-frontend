import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { createWrapperFactory } from "@/core/utilities/tests";
import { VcLineItem } from "@/ui-kit/components/molecules";
import WishlistLineItems from "./wishlist-line-items.vue";
import type { MoneyType } from "@/core/api/graphql/types";

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/composables")>()),
  useBrowserTarget: () => ({ browserTarget: ref("_self") }),
}));

function money(amount: number): MoneyType {
  return { amount, formattedAmount: `$${amount}` } as MoneyType;
}

const SALE_PRICE = money(237);

function mountWishlistLineItems() {
  return createWrapperFactory(mount, WishlistLineItems, {
    global: {
      stubs: {
        VcLineItems: { template: "<div><slot name='line-items' /></div>" },
        VcLineItem: true,
      },
      components: { VcLineItem },
    },
  })({
    props: {
      items: [{ id: "list-item-1", name: "Product", listPrice: money(400), actualPrice: SALE_PRICE }],
      editable: false,
    },
  });
}

describe("WishlistLineItems price per item", () => {
  it("shows the sale price instead of the list price", () => {
    const lineItem = mountWishlistLineItems().findComponent({ name: "VcLineItem" });

    expect(lineItem.props("showPlacedPrice")).toBe(true);
    expect(lineItem.props("actualPrice")).toEqual(SALE_PRICE);
  });
});
