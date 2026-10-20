import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { VcCheckbox } from "@/ui-kit/components/atoms";
import VcLineItem from "../line-item/vc-line-item.vue";
import VcLineItems from "./vc-line-items.vue";
import type { PreparedLineItemType } from "@/core/types";

const items = [
  { id: "line-1", name: "Fanta Mango Soda 6x330ml" },
  { id: "line-2", name: "Coca-Cola Zero 6x330ml" },
] as PreparedLineItemType[];

const global = {
  components: { VcLineItem, VcCheckbox },
  stubs: {
    VcButton: true,
    VcImage: true,
    VcProperty: true,
    VcProductPrice: true,
    VcProductTitle: true,
    VcInputDetails: true,
    VcTooltip: true,
  },
  mocks: {
    $t: (key: string, params?: { name?: string }) => (params?.name ? `${key}:${params.name}` : key),
  },
};

describe("VcLineItems selection checkboxes", () => {
  it("names the header checkbox as select-all and each row checkbox after its item", () => {
    const wrapper = mount(VcLineItems, { props: { items, selectable: true }, global });

    expect(wrapper.get("[data-test-id='vc-line-items-head-checkbox']").attributes("aria-label")).toBe(
      "ui_kit.accessibility.select_all_items",
    );
    expect(
      wrapper.findAll("[data-test-id='vc-line-item-checkbox']").map((input) => input.attributes("aria-label")),
    ).toEqual([
      "ui_kit.accessibility.select_item:Fanta Mango Soda 6x330ml",
      "ui_kit.accessibility.select_item:Coca-Cola Zero 6x330ml",
    ]);
  });
});
