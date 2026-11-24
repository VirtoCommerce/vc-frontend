import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RelatedProductsSection from "./related-products-section.vue";
import RelatedProducts from "./related-products.vue";
import type { Product } from "@/core/api/graphql/types";

const mocks = vi.hoisted(() => ({ fetchRelatedProducts: vi.fn() }));

vi.mock("@/shared/catalog/composables/useRelatedProducts", async () => {
  const { ref } = await import("vue");
  return {
    useRelatedProducts: () => ({
      relatedProducts: ref([{ id: "related" }]),
      fetchRelatedProducts: mocks.fetchRelatedProducts,
    }),
  };
});
vi.mock("@/shared/catalog/composables/useLoyaltyCatalogCurrency", async () => {
  const { ref } = await import("vue");
  return { useLoyaltyCatalogCurrency: () => ref() };
});

function product(id: string, associationsCount: number): Product {
  return { id, name: id, associations: { totalCount: associationsCount } } as Product;
}

function mountSection(value: Product) {
  return shallowMount(RelatedProductsSection, { props: { product: value } });
}

describe("RelatedProductsSection", () => {
  beforeEach(() => {
    mocks.fetchRelatedProducts.mockReset();
  });

  it("loads and renders the related products of a product that has associations", async () => {
    const wrapper = mountSection(product("a", 2));
    await flushPromises();

    expect(mocks.fetchRelatedProducts).toHaveBeenCalledWith(expect.objectContaining({ productId: "a" }));
    expect(wrapper.findComponent(RelatedProducts).props("productId")).toBe("a");
  });

  it("renders nothing for the next product without associations", async () => {
    const wrapper = mountSection(product("a", 2));
    await flushPromises();

    await wrapper.setProps({ product: product("b", 0) });
    await flushPromises();

    expect(mocks.fetchRelatedProducts).toHaveBeenCalledOnce();
    expect(wrapper.findComponent(RelatedProducts).exists()).toBe(false);
  });
});
