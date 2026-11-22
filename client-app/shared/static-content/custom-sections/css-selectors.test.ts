import { describe, expect, it } from "vitest";
import { isContainedSelector } from "./css-selectors";

describe("isContainedSelector", () => {
  it.each([
    ".a, :scope > .b",
    ":scope > .a:nth-child(1 of .b)",
    ".a:has(.b ~ .c)",
    ".a:nth-child(2n + 1 of .b)",
    "& .a",
    '[data-x=":scope, body"] .a',
  ])("keeps %s", (selector) => {
    expect(isContainedSelector(selector)).toBe(true);
  });

  it.each([
    "div :SCOPE",
    ".a:unknown(.b)",
    "div :sc\\6f\r\npe",
    ".a, div :scope",
    ":scope:has(~ .x)",
    ".a:has(> .b, ~ .c)",
    ":scope:nth-child(1 of .b)",
  ])("drops %j", (selector) => {
    expect(isContainedSelector(selector)).toBe(false);
  });

  it("checks every selector of a list from its own start", () => {
    expect(isContainedSelector(":scope > .a, :scope > .b")).toBe(true);
    expect(isContainedSelector(".a, .b :scope")).toBe(false);
  });
});
