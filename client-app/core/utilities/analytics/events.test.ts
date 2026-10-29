import { describe, it, expect, beforeEach, vi } from "vitest";
import type { CustomerOrderType, LineItemType, OrderLineItemType, Product } from "@/core/api/graphql/types";

const hoisted = vi.hoisted(() => ({
  currentCurrencyRef: { value: { code: "USD" } },
  themeContextRef: { value: { storeName: "Test Store" } },
}));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({ currentCurrency: hoisted.currentCurrencyRef }),
}));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: hoisted.themeContextRef }),
}));

vi.mock("@/core/globals", () => ({
  globals: { currencyCode: "USD" },
}));

const { createAnalyticsEvents } = await import("./events");

function buildOrderLineItem(overrides: Partial<OrderLineItemType> = {}): OrderLineItemType {
  return {
    id: "li-1",
    sku: "SKU-LI-1",
    name: "Line Item 1",
    vendor: { name: "Acme Co" },
    placedPrice: { amount: 50, currency: { code: "USD" } },
    price: { amount: 50, currency: { code: "USD" } },
    listPrice: { amount: 50, currency: { code: "USD" } },
    discountAmount: { amount: 0, currency: { code: "USD" } },
    quantity: 1,
    discounts: [],
    product: { breadcrumbs: [] },
    ...overrides,
  } as unknown as OrderLineItemType;
}

function buildOrder(overrides: Partial<CustomerOrderType> = {}): CustomerOrderType {
  return {
    id: "order-uuid-1",
    number: "ORD-12345",
    currency: { code: "USD" },
    total: { amount: 150 },
    subTotal: { amount: 100 },
    taxTotal: { amount: 20 },
    shippingTotal: { amount: 30 },
    coupons: ["SAVE10"],
    items: [
      buildOrderLineItem({ id: "li-1", sku: "SKU-A", name: "Product A", quantity: 1 }),
      buildOrderLineItem({ id: "li-2", sku: "SKU-B", name: "Product B", quantity: 2 }),
    ],
    ...overrides,
  } as unknown as CustomerOrderType;
}

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    code: "SKU-1",
    name: "Test Product",
    vendor: { name: "Acme Co" },
    brandName: "Acme Brand",
    properties: [],
    price: {
      list: { amount: 99.99 },
      actual: { amount: 99.99 },
      discountAmount: { amount: 0 },
    },
    breadcrumbs: [],
    ...overrides,
  } as unknown as Product;
}

describe("createAnalyticsEvents", () => {
  const send = vi.fn();
  const deferLogin = vi.fn();
  const events = createAnalyticsEvents({ send, deferLogin, debugPrefix: "[test]" });

  function sent(): [string, Record<string, unknown>] {
    return send.mock.calls[0] as [string, Record<string, unknown>];
  }

  beforeEach(() => {
    send.mockReset();
    deferLogin.mockReset();
    hoisted.currentCurrencyRef.value = { code: "USD" };
  });

  it("sends view_item_list with the item shape, the list context and no event-level currency", () => {
    void events.viewItemList!([buildProduct({ code: "SKU-A" })], {
      item_list_id: "list-1",
      item_list_name: "List One",
      currency: "EUR",
    });

    const [eventName, payload] = sent();
    expect(eventName).toBe("view_item_list");
    expect(payload).not.toHaveProperty("currency");
    expect(payload.items_count).toBe(1);
    expect(payload.items).toEqual([
      expect.objectContaining({
        index: 0,
        item_id: "SKU-A",
        currency: "EUR",
        item_list_id: "list-1",
        item_list_name: "List One",
      }),
    ]);
  });

  it("gives a selected cart line its position and list, not the event", () => {
    const lineItem = { ...buildOrderLineItem({ sku: "SKU-L" }), productId: "P-1" } as unknown as LineItemType;

    void events.selectItem!(lineItem, { item_list_id: "cart", index: 1 });

    const [eventName, payload] = sent();
    expect(eventName).toBe("select_item");
    expect(payload).not.toHaveProperty("index");
    expect(payload.items).toEqual([expect.objectContaining({ item_id: "SKU-L", index: 1, item_list_id: "cart" })]);
  });

  it("sends view_item with the value and the currency on the item too", () => {
    void events.viewItem!(buildProduct());

    const [eventName, payload] = sent();
    expect(eventName).toBe("view_item");
    expect(payload.currency).toBe("USD");
    expect(payload.value).toBeCloseTo(99.99);
    expect((payload.items as { currency: string }[])[0].currency).toBe("USD");
  });

  it("values add_to_cart by the configured price and quantity", () => {
    void events.addItemToCart!(buildProduct(), 3, { configuredPrice: { list: 100, actual: 80 } });

    const [eventName, payload] = sent();
    expect(eventName).toBe("add_to_cart");
    expect(payload.value).toBe(240);
    expect(payload).not.toHaveProperty("configuredPrice");
    expect(payload.items).toEqual([expect.objectContaining({ price: 100, discount: 20, quantity: 3 })]);
  });

  it("sends purchase and place_order keyed by the order id with the subtotal as value", () => {
    void events.purchase!(buildOrder());
    void events.placeOrder!(buildOrder());

    expect(send).toHaveBeenNthCalledWith(
      1,
      "purchase",
      expect.objectContaining({ transaction_id: "order-uuid-1", value: 100, items_count: 2 }),
    );
    expect(send).toHaveBeenNthCalledWith(
      2,
      "place_order",
      expect.objectContaining({ transaction_id: "order-uuid-1", value: 100 }),
    );
  });

  it("sends search with the visible items as CSV", () => {
    void events.search!("printer", [{ code: "A" }, { code: "B" }], 12);

    expect(send).toHaveBeenCalledWith("search", { search_term: "printer", items_count: 12, visible_items: "A, B" });
  });

  // Sent now, it would race the reload a sign-in starts and carry the signed-out identity.
  it("leaves a successful sign-in to the page it lands on and sends a failed one at once", () => {
    void events.login!("password", { success: true });
    void events.login!("password", { success: false, errors: "invalid_grant" });

    expect(deferLogin).toHaveBeenCalledWith("password", { success: true });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("login", { success: false, errors: "invalid_grant", method: "password" });
  });

  it("names the form on form_open and form_submit", () => {
    void events.formOpen!("quote_request", { quote_id: "q-1" });
    void events.formSubmit!("quote_request", { quote_id: "q-1", success: true });

    expect(send).toHaveBeenNthCalledWith(1, "form_open", { form_name: "quote_request", quote_id: "q-1" });
    expect(send).toHaveBeenNthCalledWith(2, "form_submit", {
      form_name: "quote_request",
      quote_id: "q-1",
      success: true,
    });
  });

  // The bus catches only synchronous throws, so a broken cart must not take the tracker down.
  it("logs instead of throwing when a checkout payload cannot be built", () => {
    expect(() => events.beginCheckout!(undefined as never)).not.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});
