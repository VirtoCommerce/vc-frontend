import { describe, expect, it } from "vitest";
import { CONFIGURATION_URL_SEARCH_PARAM } from "@/core/constants";
import { getConfigurationLink, getDisplayPrice, getProductCategoryKey, getProductCategoryLabel } from ".";
import type { ICompareDisplayProduct, ICompareProductEntry } from "../types";
import type { Breadcrumb, PriceType, Product } from "@/core/api/graphql/types";

function breadcrumb(overrides: Partial<Breadcrumb>): Breadcrumb {
  return { itemId: "id", title: "title", typeName: "Category", ...overrides };
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "product-1",
    breadcrumbs: [],
    price: { actual: { amount: 10 } } as PriceType,
    ...overrides,
  } as Product;
}

function entry(overrides: Partial<ICompareProductEntry> = {}): ICompareProductEntry {
  return { productId: "product-1", categoryKey: "cat", ...overrides };
}

describe("getProductCategoryKey / getProductCategoryLabel", () => {
  it("joins itemIds of the first COMPARE_CATEGORY_DEPTH (2) category breadcrumbs", () => {
    const p = product({
      breadcrumbs: [
        breadcrumb({ itemId: "root", title: "Root" }),
        breadcrumb({ itemId: "mid", title: "Mid" }),
        breadcrumb({ itemId: "leaf", title: "Leaf" }),
      ],
    });

    expect(getProductCategoryKey(p)).toBe("root/mid");
    expect(getProductCategoryLabel(p)).toBe("Mid");
  });

  it("ignores non-Category breadcrumbs (e.g. Catalog/Product)", () => {
    const p = product({
      breadcrumbs: [
        breadcrumb({ itemId: "catalog", title: "Catalog", typeName: "Catalog" }),
        breadcrumb({ itemId: "root", title: "Root" }),
        breadcrumb({ itemId: "prod", title: "This product", typeName: "Product" }),
      ],
    });

    expect(getProductCategoryKey(p)).toBe("root");
    expect(getProductCategoryLabel(p)).toBe("Root");
  });

  it("returns an empty key/label for a product with no category breadcrumbs", () => {
    const p = product({ breadcrumbs: [] });

    expect(getProductCategoryKey(p)).toBe("");
    expect(getProductCategoryLabel(p)).toBe("");
  });

  it("handles a missing breadcrumbs field without throwing", () => {
    const p = product({ breadcrumbs: undefined });

    expect(getProductCategoryKey(p)).toBe("");
    expect(getProductCategoryLabel(p)).toBe("");
  });

  it("respects a custom depth", () => {
    const p = product({
      breadcrumbs: [
        breadcrumb({ itemId: "root", title: "Root" }),
        breadcrumb({ itemId: "mid", title: "Mid" }),
        breadcrumb({ itemId: "leaf", title: "Leaf" }),
      ],
    });

    expect(getProductCategoryKey(p, 1)).toBe("root");
    expect(getProductCategoryKey(p, 3)).toBe("root/mid/leaf");
  });
});

describe("getDisplayPrice", () => {
  it("returns the plain price for a product without variations", () => {
    const price = { actual: { amount: 10 } } as PriceType;
    const p = product({ hasVariations: false, price, minVariationPrice: undefined });

    expect(getDisplayPrice(p)).toBe(price);
  });

  it("returns minVariationPrice when the product has variations and it is set", () => {
    const price = { actual: { amount: 10 } } as PriceType;
    const minVariationPrice = { actual: { amount: 5 } } as PriceType;
    const p = product({ hasVariations: true, price, minVariationPrice });

    expect(getDisplayPrice(p)).toBe(minVariationPrice);
  });

  it("falls back to the plain price when hasVariations is true but minVariationPrice is missing", () => {
    const price = { actual: { amount: 10 } } as PriceType;
    const p = product({ hasVariations: true, price, minVariationPrice: undefined });

    expect(getDisplayPrice(p)).toBe(price);
  });
});

describe("getConfigurationLink", () => {
  it("routes by slug when the product has one, with no configuration query param for a plain entry", () => {
    const item: ICompareDisplayProduct = {
      product: product({ id: "p1", slug: "cool-product" }),
      entry: entry(),
    };

    expect(getConfigurationLink(item)).toEqual({ path: "/cool-product", query: {} });
  });

  it("routes by product id (named route) when there is no slug", () => {
    const item: ICompareDisplayProduct = {
      product: product({ id: "p1", slug: undefined }),
      entry: entry(),
    };

    expect(getConfigurationLink(item)).toEqual({
      name: "Product",
      params: { productId: "p1" },
      query: {},
    });
  });

  it("adds the configuration query param for a configured entry (localId set)", () => {
    const item: ICompareDisplayProduct = {
      product: product({ id: "p1", slug: "cool-product" }),
      entry: entry({ localId: "local-42" }),
    };

    expect(getConfigurationLink(item)).toEqual({
      path: "/cool-product",
      query: { [CONFIGURATION_URL_SEARCH_PARAM]: "local-42" },
    });
  });
});
