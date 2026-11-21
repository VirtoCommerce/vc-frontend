import { describe, expect, it } from "vitest";
import { presetStyles } from "./index";

describe("presetStyles", () => {
  it("is keyed by preset name, like presets", () => {
    expect(Object.keys(presetStyles)).toEqual(["paprika"]);
  });
});
