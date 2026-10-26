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

  it("is claimed by the first order placed after the consent, and no other order gets it", () => {
    cardSaving.require("consent-1", "cart-1");

    expect(cardSaving.read({ order: { id: "old-order", createdDate: "2026-10-25T09:00:00Z" } })).toBeUndefined();
    expect(cardSaving.read({ order: { id: "order-1", createdDate: "2026-10-26T10:01:00Z" } })?.consentId).toBe(
      "consent-1",
    );
    expect(cardSaving.read({ order: { id: "order-2", createdDate: "2026-10-26T10:02:00Z" } })).toBeUndefined();
    expect(cardSaving.read({ order: { id: "order-1", createdDate: "2026-10-26T10:01:00Z" } })?.orderId).toBe("order-1");
  });

  it("covers nothing when the form pays neither a cart nor an order", () => {
    cardSaving.require("consent-1", "cart-1");

    expect(cardSaving.read({})).toBeUndefined();
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
