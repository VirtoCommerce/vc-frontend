import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCardSavingRequirement } from "../composables/useCardSavingRequirement";
import {
  forgetStoredCredentialIntent,
  rememberStoredCredentialIntent,
  withStoredCredentialIntent,
} from "./stored-credential-intent";

// A payment that leaves the site (hosted page, 3-D Secure redirect) comes back to authorizePayment without the
// customer's card choice; the platform must still be told to save the card, under the right consent.
describe("withStoredCredentialIntent", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds back the choice remembered for the order", () => {
    rememberStoredCredentialIntent("order-1", [
      { key: "storeForFutureUse", value: "true" },
      { key: "consentId", value: "consent-1" },
      { key: "nonce", value: "not remembered" },
    ]);

    const parameters = withStoredCredentialIntent("order-1", [{ key: "datatransTrxId", value: "trx-1" }]);

    expect(parameters).toEqual([
      { key: "datatransTrxId", value: "trx-1" },
      { key: "storeForFutureUse", value: "true" },
      { key: "consentId", value: "consent-1" },
    ]);
  });

  it("keeps the order's choice to itself", () => {
    rememberStoredCredentialIntent("order-1", [{ key: "storeForFutureUse", value: "true" }]);

    expect(withStoredCredentialIntent("order-2", [])).toEqual([]);
  });

  it("sends a call that already carries a card choice as it is", () => {
    rememberStoredCredentialIntent("order-1", [
      { key: "storeForFutureUse", value: "true" },
      { key: "consentId", value: "consent-1" },
    ]);

    expect(withStoredCredentialIntent("order-1", [{ key: "storeForFutureUse", value: "false" }])).toEqual([
      { key: "storeForFutureUse", value: "false" },
    ]);
    expect(withStoredCredentialIntent("order-1", [{ key: "storedPaymentMethodId", value: "card-1" }])).toEqual([
      { key: "storedPaymentMethodId", value: "card-1" },
    ]);
  });

  it("falls back to a module's requirement that the card be saved", () => {
    useCardSavingRequirement().require("consent-9");

    expect(withStoredCredentialIntent("order-1", [])).toEqual([
      { key: "storeForFutureUse", value: "true" },
      { key: "consentId", value: "consent-9" },
    ]);
  });

  it("forgets the choice once the order is paid", () => {
    rememberStoredCredentialIntent("order-1", [{ key: "storeForFutureUse", value: "true" }]);

    forgetStoredCredentialIntent("order-1");

    expect(withStoredCredentialIntent("order-1", [])).toEqual([]);
  });

  it("drops a choice older than two hours", () => {
    vi.useFakeTimers();
    rememberStoredCredentialIntent("order-1", [{ key: "storeForFutureUse", value: "true" }]);

    vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1);

    expect(withStoredCredentialIntent("order-1", [])).toEqual([]);
  });
});
