import { describe, expect, it } from "vitest";
import { isComposingKey } from "./keyboard";

describe("isComposingKey", () => {
  it.each([
    ["a key inside a composition", { key: "Enter", isComposing: true }, true],
    ["the commit Enter Safari reports by keyCode only", { key: "Enter", keyCode: 229 }, true],
    ["a plain Enter", { key: "Enter" }, false],
  ])("tells %s", (_label, init, expected) => {
    expect(isComposingKey(new KeyboardEvent("keydown", init))).toBe(expected);
  });
});
