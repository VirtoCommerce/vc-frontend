import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Product } from "@/core/api/graphql/types";

const hoisted = vi.hoisted(() => ({
  captureMock: vi.fn(),
  deferLoginMock: vi.fn(),
}));

vi.mock("./client", () => ({
  capture: hoisted.captureMock,
}));

vi.mock("./pending-login", () => ({
  deferLogin: hoisted.deferLoginMock,
}));

vi.mock("@/core/composables/useCurrency", () => ({
  useCurrency: () => ({ currentCurrency: { value: { code: "USD" } } }),
}));

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext: { value: { storeName: "Test Store" } } }),
}));

vi.mock("@/core/globals", () => ({
  globals: { currencyCode: "USD" },
}));

const { events } = await import("./events");

// Every name the bus can dispatch: a missing handler logs a warning on every fire.
const BUS_EVENT_NAMES = [
  "viewItemList",
  "selectItem",
  "viewItem",
  "addItemToWishList",
  "addItemToCart",
  "updateCartItem",
  "addItemsToCart",
  "addBulkItemsToCart",
  "removeItemsFromCart",
  "viewCart",
  "clearCart",
  "beginCheckout",
  "addShippingInfo",
  "addPaymentInfo",
  "purchase",
  "placeOrder",
  "search",
  "viewSearchResults",
  "login",
  "signUp",
  "formOpen",
  "formSubmit",
] as const;

describe("posthog events", () => {
  beforeEach(() => {
    hoisted.captureMock.mockReset();
    hoisted.deferLoginMock.mockReset();
  });

  it("handles every event the bus dispatches", () => {
    BUS_EVENT_NAMES.forEach((name) => {
      expect(events[name], name).toBeTypeOf("function");
    });
  });

  it("captures the shared GA4-named events through the client", () => {
    void events.viewItem!({ code: "SKU-1", name: "Product", price: { actual: { amount: 10 } } } as unknown as Product);

    expect(hoisted.captureMock).toHaveBeenCalledWith(
      "view_item",
      expect.objectContaining({ currency: "USD", value: 10 }),
    );
  });

  // Sent now, it would race the reload a sign-in starts and carry the signed-out identity.
  it("leaves a successful sign-in to the page it lands on", () => {
    void events.login!("password", { success: true });

    expect(hoisted.deferLoginMock).toHaveBeenCalledWith("password", { success: true });
    expect(hoisted.captureMock).not.toHaveBeenCalled();
  });
});
