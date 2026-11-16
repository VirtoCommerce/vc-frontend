import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ProductInfo from "./product-info.vue";
import type { IPageContent } from "../types";
import type { Product } from "@/core/api/graphql/types";

vi.mock("@/shared/catalog", () => ({ ImageGallery: {}, DiscountBadge: {}, ProductVideos: {} }));

vi.mock("@/shared/catalog/components/badges-wrapper.vue", () => ({ default: {} }));

vi.mock("@/shared/catalog/components/purchased-before-badge.vue", () => ({ default: {} }));

vi.mock("@/shared/catalog/composables/useProductVariationProperties", async () => {
  const { ref } = await import("vue");
  return { useProductVariationProperties: () => ({ applicableVariations: ref([]) }) };
});

vi.mock("@/shared/catalog/components/product", async () => {
  const { defineComponent, h } = await import("vue");
  const block = defineComponent({
    props: { model: { type: Object, required: true } },
    setup: (props) => () => h("div", { "data-test-id": "product-info-test-block" }, String(props.model.title)),
  });

  return { default: { "product-properties": block } };
});

function mountProductInfo(blocks: Array<{ id: string; type: string; title?: string }>) {
  return mount(ProductInfo, {
    props: {
      product: { images: [], videos: [] } as unknown as Product,
      model: { blocks } as IPageContent,
      variations: [],
    },
    global: { stubs: { VcWidget: { template: "<div><slot /></div>" }, VcImage: true } },
  });
}

describe("ProductInfo", () => {
  it("renders a registered product block", () => {
    const wrapper = mountProductInfo([{ id: "properties", type: "product-properties", title: "Specs" }]);

    expect(wrapper.find('[data-test-id="product-info-test-block"]').text()).toBe("Specs");
  });

  it.each(["text", "toString", "constructor"])("renders nothing for the block type %s", (type) => {
    const wrapper = mountProductInfo([{ id: "unknown", type }]);

    expect(wrapper.find(".product-info__blocks").text()).toBe("");
    expect(wrapper.find("#unknown").exists()).toBe(false);
  });
});
