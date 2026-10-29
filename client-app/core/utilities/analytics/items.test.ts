import { describe, it, expect, beforeEach, vi } from "vitest";
import type { LineItemType, Product } from "@/core/api/graphql/types";

const hoisted = vi.hoisted(() => ({
  themeContextRef: { value: { storeName: "Test Store" } },
}));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({
    themeContext: hoisted.themeContextRef,
  }),
}));

const { productToAnalyticsItem, lineItemToAnalyticsItem } = await import("./items");

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    code: "SKU-1",
    name: "Test Product",
    vendor: { name: "Acme Co" },
    brandName: "Acme Brand",
    properties: [],
    price: {
      list: { amount: 99.99 },
      discountAmount: { amount: 0 },
    },
    breadcrumbs: [],
    ...overrides,
  } as unknown as Product;
}

function buildLineItem(overrides: Partial<LineItemType> = {}): LineItemType {
  return {
    id: "li-1",
    sku: "SKU-LI-1",
    name: "Line Item 1",
    vendor: { name: "Acme Co" },
    placedPrice: { amount: 50, currency: { code: "USD" } },
    listPrice: { amount: 50, currency: { code: "USD" } },
    discountAmount: { amount: 0, currency: { code: "USD" } },
    quantity: 2,
    discounts: [],
    product: { breadcrumbs: [] },
    ...overrides,
  } as unknown as LineItemType;
}

describe("productToAnalyticsItem", () => {
  beforeEach(() => {
    hoisted.themeContextRef.value = { storeName: "Test Store" };
  });

  it("maps the product fields and the list context", () => {
    const item = productToAnalyticsItem(
      buildProduct({ price: { list: { amount: 120 }, discountAmount: { amount: 20 } } } as unknown as Partial<Product>),
      3,
      { itemListId: "list-1", itemListName: "List One", currency: "EUR" },
    );

    expect(item).toMatchObject({
      index: 3,
      item_id: "SKU-1",
      item_name: "Test Product",
      item_brand: "Acme Brand",
      affiliation: "Acme Co",
      currency: "EUR",
      item_list_id: "list-1",
      item_list_name: "List One",
      price: 120,
      discount: 20,
    });
    expect(item).not.toHaveProperty("quantity");
  });

  it("falls back affiliation to the store name when the product has no vendor", () => {
    hoisted.themeContextRef.value = { storeName: "Mercury Store" };

    expect(productToAnalyticsItem(buildProduct({ vendor: undefined })).affiliation).toBe("Mercury Store");
  });

  it("reads the brand from the brand object, then the brand name, then the brand property", () => {
    expect(
      productToAnalyticsItem(buildProduct({ brand: { name: "Object Brand" } } as unknown as Partial<Product>))
        .item_brand,
    ).toBe("Object Brand");
    expect(productToAnalyticsItem(buildProduct()).item_brand).toBe("Acme Brand");
    expect(
      productToAnalyticsItem(
        buildProduct({
          brandName: undefined,
          properties: [{ name: "Brand", value: "Property Brand" }],
        } as unknown as Partial<Product>),
      ).item_brand,
    ).toBe("Property Brand");
  });

  it("maps up to five categories from the breadcrumbs and skips the product entry", () => {
    const item = productToAnalyticsItem(
      buildProduct({
        breadcrumbs: [
          { title: "Electronics", typeName: "Category" },
          { title: "Phones", typeName: "Category" },
          { title: "Smartphones", typeName: "Category" },
          { title: "Android", typeName: "Category" },
          { title: "Flagship", typeName: "Category" },
          { title: "Refurbished", typeName: "Category" },
          { title: "Test Product", typeName: "CatalogProduct" },
        ],
      } as unknown as Partial<Product>),
    );

    expect(item.item_category).toBe("Electronics");
    expect(item.item_category5).toBe("Flagship");
    expect(item).not.toHaveProperty("item_category6");
  });

  // A configured product's price is the configuration's, not the catalog's.
  it("takes the configured price over the product price", () => {
    const item = productToAnalyticsItem(buildProduct(), undefined, { list: 200, actual: 150 }, { currency: "USD" });

    expect(item.price).toBe(200);
    expect(item.discount).toBe(50);
    expect(item.currency).toBe("USD");
  });
});

describe("lineItemToAnalyticsItem", () => {
  it("maps the line fields, quantity and promotions", () => {
    const item = lineItemToAnalyticsItem(
      buildLineItem({
        discounts: [
          { promotionId: "promo-1", promotionName: "Spring" },
          { promotionId: "promo-2", promotionName: "Loyalty" },
        ],
      } as unknown as Partial<LineItemType>),
      1,
    );

    expect(item).toMatchObject({
      index: 1,
      item_id: "SKU-LI-1",
      item_name: "Line Item 1",
      affiliation: "Acme Co",
      currency: "USD",
      price: 50,
      quantity: 2,
      promotion_id: "promo-1",
      promotion_name: "Spring",
      promotions: "Spring, Loyalty",
    });
  });

  it("leaves promotions undefined for a line without discounts", () => {
    expect(lineItemToAnalyticsItem(buildLineItem()).promotions).toBeUndefined();
  });
});
