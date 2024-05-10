import { describe, it, expect } from "vitest";
import { replaceXFromBeginning } from "./index";

describe("extractHostname function", () => {
  const testCases: [string, string][] = [
    ["XXXXXXXXXXXX1234", "•••• 1234"], // "Visa"
    ["XXXXXXXXXXXX4321", "•••• 4321"], // "MasterCard",
    ["XXXXXXXXXXX5678", "•••• 5678"], // "American Express",
    ["XXXXXXXXXXXX9876", "•••• 9876"], // "Discover",
  ];

  it.each(testCases)("replaceXFromBeginning(%s) -> %s", (maskedNumber, expected) => {
    expect(replaceXFromBeginning(maskedNumber)).toBe(expected);
  });
});
