import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Product } from "@/core/api/graphql/types";

const hoisted = vi.hoisted(() => ({
  currentCurrencyRef: { value: { code: "USD" } as { code: string } },
  themeContextRef: { value: { storeName: "Test Store" } as { storeName: string } },
  sendEventMock: vi.fn(),
}));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({
    currentCurrency: hoisted.currentCurrencyRef,
  }),
}));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({
    themeContext: hoisted.themeContextRef,
  }),
}));

vi.mock("@/core/globals", () => ({
  globals: { currencyCode: "USD" },
}));

vi.mock("./utils", async () => {
  const actual = await vi.importActual<typeof import("./utils")>("./utils");
  return {
    ...actual,
    sendEvent: hoisted.sendEventMock,
  };
});

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
    availabilityData: { availableQuantity: 10 },
    breadcrumbs: [],
    ...overrides,
  } as unknown as Product;
}

describe("google-analytics events", () => {
  beforeEach(() => {
    hoisted.sendEventMock.mockReset();
    hoisted.currentCurrencyRef.value = { code: "USD" };
    hoisted.themeContextRef.value = { storeName: "Test Store" };
  });

  describe("viewItemList", () => {
    it("sends items[] array (not items_skus string)", async () => {
      const { events } = await import("./events");
      const products = [buildProduct({ code: "SKU-A" }), buildProduct({ code: "SKU-B" })];

      void events.viewItemList!(products, {
        item_list_id: "recently_browsed_products",
        item_list_name: "Recently browsed",
        currency: "USD",
      });

      const [eventName, payload] = hoisted.sendEventMock.mock.calls[0];
      expect(eventName).toBe("view_item_list");
      expect(payload).not.toHaveProperty("items_skus");
      expect(Array.isArray(payload.items)).toBe(true);
      expect(payload.items).toHaveLength(2);
    });

    it("maps all required GA4 fields per AC1 (event-level + per-item shape)", async () => {
      const { events } = await import("./events");
      const product = buildProduct({
        code: "SKU-A",
        name: "Product A",
        vendor: { name: "Acme Co" },
        availabilityData: { availableQuantity: 563 },
        price: {
          list: { amount: 120 },
          discountAmount: { amount: 20 },
        },
      } as unknown as Partial<Product>);

      void events.viewItemList!([product], {
        item_list_id: "list-1",
        item_list_name: "List One",
        currency: "EUR",
      });

      const payload = hoisted.sendEventMock.mock.calls[0][1];

      // Event-level shape: items_count present, event-level currency omitted (per GA4 spec).
      expect(payload.items_count).toBe(1);
      expect(payload.items_count).toBe(payload.items.length);
      expect("currency" in payload).toBe(false);

      // Per-item shape: every GA4 field expected by AC1.
      const item = payload.items[0];
      expect(item.index).toBe(0);
      expect(item.item_id).toBe("SKU-A");
      expect(item.item_name).toBe("Product A");
      expect(item.item_brand).toBe("Acme Brand");
      expect(item.affiliation).toBe("Acme Co");
      expect(item.currency).toBe("EUR");
      expect(item.item_list_id).toBe("list-1");
      expect(item.item_list_name).toBe("List One");
      expect(item.price).toBe(120);
      expect(item.discount).toBe(20);
      // Quantity must be hardcoded to 1 for view-type events, NOT stock count.
      expect(item.quantity).toBe(1);
    });

    it.each([
      [
        "brand.name",
        { brand: { name: "Foo Brand" }, brandName: undefined } as unknown as Partial<Product>,
        "Foo Brand",
      ],
      ["brandName", { brand: undefined, brandName: "Fallback Brand" } as unknown as Partial<Product>, "Fallback Brand"],
      [
        "case-insensitive 'Brand' property",
        {
          brand: undefined,
          brandName: undefined,
          properties: [{ name: "Brand", value: "PropBrand" }],
        } as unknown as Partial<Product>,
        "PropBrand",
      ],
    ])("resolves item_brand from %s", async (_label, overrides, expected) => {
      const { events } = await import("./events");
      const product = buildProduct(overrides);

      void events.viewItemList!([product], { currency: "USD" });

      const payload = hoisted.sendEventMock.mock.calls[0][1];
      expect(payload.items[0].item_brand).toBe(expected);
    });

    it("falls back affiliation to store name when product has no vendor", async () => {
      hoisted.themeContextRef.value = { storeName: "Mercury Store" };
      const { events } = await import("./events");
      const product = buildProduct({ vendor: undefined } as unknown as Partial<Product>);

      void events.viewItemList!([product], { currency: "USD" });

      const payload = hoisted.sendEventMock.mock.calls[0][1];
      expect(payload.items[0].affiliation).toBe("Mercury Store");
    });

    it("maps item_category fields from breadcrumbs and excludes the CatalogProduct entry", async () => {
      const { events } = await import("./events");
      const product = buildProduct({
        breadcrumbs: [
          { title: "Electronics", typeName: "Category" },
          { title: "Phones", typeName: "Category" },
          { title: "Smartphones", typeName: "Category" },
          { title: "Test Product", typeName: "CatalogProduct" },
        ],
      } as unknown as Partial<Product>);

      void events.viewItemList!([product], { currency: "USD" });

      const item = hoisted.sendEventMock.mock.calls[0][1].items[0];
      expect(item.item_category).toBe("Electronics");
      expect(item.item_category2).toBe("Phones");
      expect(item.item_category3).toBe("Smartphones");
      // CatalogProduct entry must not leak into item_category4.
      expect(item.item_category4).toBeUndefined();
    });
  });
});
