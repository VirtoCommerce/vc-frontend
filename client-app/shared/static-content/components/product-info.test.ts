import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PageBuilderSection from "./page-builder-section.vue";
import ProductInfo from "./product-info.vue";
import type { Product } from "@/core/api/graphql/types";

function mountProductInfo(blocks: { id: string; type: string }[]) {
  return shallowMount(ProductInfo, {
    props: {
      product: { id: "p1", images: [], videos: [], hasVariations: false } as unknown as Product,
      model: { id: "info", type: "product-info", blocks },
      variations: [],
    },
  });
}

describe("ProductInfo", () => {
  it("renders the product's blocks and not a page section of a block's type", () => {
    const wrapper = mountProductInfo([
      { id: "text", type: "text" },
      { id: "properties", type: "product-properties" },
    ]);

    expect(wrapper.findAllComponents(PageBuilderSection).map((section) => section.props("item").id)).toEqual([
      "properties",
    ]);
  });

  it.each(["text", "toString", "constructor"])("renders nothing for the block type %s", (type) => {
    const wrapper = mountProductInfo([{ id: "unknown", type }]);

    expect(wrapper.findAllComponents(PageBuilderSection)).toHaveLength(0);
  });
});
