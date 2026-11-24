import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RecommendedProductsSection from "./recommended-products-section.vue";
import RecommendedProducts from "./recommended-products.vue";
import type { Product } from "@/core/api/graphql/types";

const mocks = vi.hoisted(() => {
  const recommendedProducts: { value: Record<string, unknown[]> } = { value: {} };
  return { recommendedProducts, fetchRecommendedProducts: vi.fn() };
});

vi.mock("@/shared/catalog/composables/useRecommendedProducts", async () => {
  const { ref } = await import("vue");
  return {
    useRecommendedProducts: () => ({
      recommendedProducts: ref(mocks.recommendedProducts.value),
      fetchRecommendedProducts: mocks.fetchRecommendedProducts,
    }),
  };
});
vi.mock("@/shared/catalog/composables/useLoyaltyCatalogCurrency", async () => {
  const { ref } = await import("vue");
  return { useLoyaltyCatalogCurrency: () => ref() };
});

type BlocksType = { id: string; model?: string; hidden?: boolean }[];

const product = (id: string) => ({ id, name: id }) as Product;

async function mountSection(blocks: BlocksType) {
  const wrapper = shallowMount(RecommendedProductsSection, {
    props: { product: product("p1"), blocks },
    global: { mocks: { $t: (key: string) => key } },
  });
  await flushPromises();
  return wrapper;
}

const requestedModels = (call: number) =>
  (mocks.fetchRecommendedProducts.mock.calls[call][0] as { productId: string; model: string }[]).map(
    ({ productId, model }) => `${productId}:${model}`,
  );

describe("RecommendedProductsSection", () => {
  beforeEach(() => {
    mocks.recommendedProducts.value = { related: [{ id: "r1" }], bought: [{ id: "b1" }] };
    mocks.fetchRecommendedProducts.mockReset();
  });

  it("requests only the shown blocks that name a model", async () => {
    await mountSection([
      { id: "related", model: "related" },
      { id: "bought", model: "bought", hidden: true },
      { id: "empty" },
    ]);

    expect(mocks.fetchRecommendedProducts).toHaveBeenCalledOnce();
    expect(requestedModels(0)).toEqual(["p1:related"]);
  });

  it("does not request again for new blocks with the same models", async () => {
    const wrapper = await mountSection([{ id: "related", model: "related" }]);

    await wrapper.setProps({ blocks: [{ id: "related", model: "related" }] });
    await flushPromises();

    expect(mocks.fetchRecommendedProducts).toHaveBeenCalledOnce();
  });

  it("requests again for another product", async () => {
    const wrapper = await mountSection([{ id: "related", model: "related" }]);

    await wrapper.setProps({ product: product("p2") });
    await flushPromises();

    expect(mocks.fetchRecommendedProducts).toHaveBeenCalledTimes(2);
    expect(requestedModels(1)).toEqual(["p2:related"]);
  });

  it("renders a list per model with products and nothing for a model without them", async () => {
    mocks.recommendedProducts.value = { related: [{ id: "r1" }], bought: [] };

    const wrapper = await mountSection([
      { id: "related", model: "related" },
      { id: "bought", model: "bought" },
    ]);

    expect(wrapper.findAllComponents(RecommendedProducts).map((list) => list.props("model"))).toEqual(["related"]);
  });

  it("renders nothing when every model returns an empty list", async () => {
    mocks.recommendedProducts.value = { related: [] };

    const wrapper = await mountSection([{ id: "related", model: "related" }]);

    expect(wrapper.html()).toBe("<!--v-if-->");
  });
});
