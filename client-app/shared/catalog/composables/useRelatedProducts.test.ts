// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRelatedProducts } from "./useRelatedProducts";
import type { ProductAssociation } from "@/core/api/graphql/types";

const searchRelatedProductsMock = vi.hoisted(() => vi.fn());

vi.mock("@/core/api/graphql/catalog", () => ({ searchRelatedProducts: searchRelatedProductsMock }));

function answerLater() {
  let answer!: (associations: ProductAssociation[]) => void;
  searchRelatedProductsMock.mockReturnValueOnce(
    new Promise<ProductAssociation[]>((resolve) => {
      answer = resolve;
    }),
  );
  return (productId: string) => answer([{ product: { id: `${productId}-related` } } as ProductAssociation]);
}

describe("useRelatedProducts", () => {
  beforeEach(() => {
    searchRelatedProductsMock.mockReset();
  });

  it("keeps the latest product's list when the previous product's request answers last", async () => {
    const { relatedProducts, loading, fetchRelatedProducts } = useRelatedProducts();
    const answerA = answerLater();
    const answerB = answerLater();

    const fetchingA = fetchRelatedProducts({ productId: "a" });
    const fetchingB = fetchRelatedProducts({ productId: "b" });
    answerB("b");
    await fetchingB;
    answerA("a");
    await fetchingA;

    expect(relatedProducts.value.map((product) => product.id)).toEqual(["b-related"]);
    expect(loading.value).toBe(false);
  });

  it("drops the previous product's list as soon as the next product's request starts", async () => {
    const { relatedProducts, fetchRelatedProducts } = useRelatedProducts();
    const answerA = answerLater();
    answerLater();

    const fetchingA = fetchRelatedProducts({ productId: "a" });
    answerA("a");
    await fetchingA;
    expect(relatedProducts.value.map((product) => product.id)).toEqual(["a-related"]);

    void fetchRelatedProducts({ productId: "b" });

    expect(relatedProducts.value).toEqual([]);
  });

  it("stays loading while the latest request runs after the previous one answers", async () => {
    const { relatedProducts, loading, fetchRelatedProducts } = useRelatedProducts();
    const answerA = answerLater();
    answerLater();

    const fetchingA = fetchRelatedProducts({ productId: "a" });
    void fetchRelatedProducts({ productId: "b" });
    answerA("a");
    await fetchingA;

    expect(relatedProducts.value).toEqual([]);
    expect(loading.value).toBe(true);
  });
});
