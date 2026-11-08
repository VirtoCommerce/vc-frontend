import { describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities";
import { savedCardErrorMessage, savedCardLabel } from "./saved-card-label";

vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn() } }));

describe("savedCardLabel", () => {
  it("names the card by its brand and last 4 digits", () => {
    expect(savedCardLabel("Visa", "4242", "Karte")).toBe("Visa •••• 4242");
  });

  it("uses the given translated word when the brand is unknown", () => {
    expect(savedCardLabel(null, "4242", "Karte")).toBe("Karte •••• 4242");
    expect(savedCardLabel("", undefined, "Karte")).toBe("Karte •••• ????");
  });
});

describe("savedCardErrorMessage", () => {
  it("shows the translated fallback and keeps the server's message for the log", () => {
    const error = { graphQLErrors: [{ message: "This card pays for 2 subscriptions." }] };

    expect(savedCardErrorMessage(error, "Etwas ist schiefgelaufen.")).toBe("Etwas ist schiefgelaufen.");
    expect(Logger.error).toHaveBeenCalledWith("saved-cards", error);
  });
});
