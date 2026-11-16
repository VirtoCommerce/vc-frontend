import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCardSavingRequirement } from "./useCardSavingRequirement";

// Accepting subscription terms on a cart requires the card of that checkout to be saved — and of no other checkout.
describe("useCardSavingRequirement", () => {
  // called as methods: a bare `require(...)` reads as a CommonJS import to the dependency check
  const cardSaving = useCardSavingRequirement();
  const consentAt = new Date("2026-10-26T10:00:00Z");

  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(consentAt);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("covers a payment of the same cart only", () => {
    cardSaving.require("consent-1", "cart-1");

    expect(cardSaving.read({ cart: { id: "cart-1" } })?.consentId).toBe("consent-1");
    expect(cardSaving.read({ cart: { id: "cart-2" } })).toBeUndefined();
  });

  it("covers the order placed from the consent's cart only", () => {
    cardSaving.require("consent-1", "cart-1");

    vi.setSystemTime(new Date(consentAt.getTime() + 60 * 1000));
    expect(cardSaving.read({ order: { id: "order-2", shoppingCartId: "cart-2" } })).toBeUndefined();
    expect(cardSaving.read({ order: { id: "order-3" } })).toBeUndefined();
    expect(cardSaving.read({ order: { id: "order-1", shoppingCartId: "cart-1" } })?.consentId).toBe("consent-1");
    // reading has no side effect: another order of another cart still gets nothing, the right one still gets it
    expect(cardSaving.read({ order: { id: "order-2", shoppingCartId: "cart-2" } })).toBeUndefined();
    expect(cardSaving.read({ order: { id: "order-1", shoppingCartId: "cart-1" } })?.consentId).toBe("consent-1");
  });

  it("covers nothing when the form pays neither a cart nor an order", () => {
    cardSaving.require("consent-1", "cart-1");

    expect(cardSaving.read({})).toBeUndefined();
  });

  it("changes its revision on every require and clear", () => {
    const before = cardSaving.revision.value;

    cardSaving.require("consent-1", "cart-1");
    expect(cardSaving.revision.value).toBe(before + 1);

    cardSaving.clear();
    expect(cardSaving.revision.value).toBe(before + 2);
  });

  it("expires after two hours and can be cleared", () => {
    cardSaving.require("consent-1", "cart-1");
    vi.setSystemTime(new Date(consentAt.getTime() + 2 * 60 * 60 * 1000 + 1));
    expect(cardSaving.read({ cart: { id: "cart-1" } })).toBeUndefined();

    vi.setSystemTime(consentAt);
    cardSaving.require("consent-2", "cart-1");
    cardSaving.clear();
    expect(cardSaving.read({ cart: { id: "cart-1" } })).toBeUndefined();
  });
});
