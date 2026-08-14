import { describe, expect, it } from "vitest";
import { getAnchorId, slugifyAnchor } from "./anchors";

describe("slugifyAnchor", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugifyAnchor("Technical Specifications")).toBe("technical-specifications");
  });

  it("strips characters that are not valid in a hash link", () => {
    expect(slugifyAnchor("Back To Top!")).toBe("back-to-top");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugifyAnchor("--hello--")).toBe("hello");
  });

  it("returns an empty string when nothing usable is left", () => {
    expect(slugifyAnchor("Спецификация")).toBe("");
  });
});

describe("getAnchorId", () => {
  it("uses the generated id when no anchor is authored", () => {
    expect(getAnchorId({ id: "text2" })).toBe("text2");
  });

  it("uses the generated id when the anchor is blank", () => {
    expect(getAnchorId({ id: "text2", anchor: "   " })).toBe("text2");
  });

  it("prefers the authored anchor, slugified", () => {
    expect(getAnchorId({ id: "text2", anchor: "Technical Specifications" })).toBe("technical-specifications");
  });

  it("falls back to the id when the anchor slugifies to nothing", () => {
    expect(getAnchorId({ id: "text2", anchor: "Спецификация" })).toBe("text2");
  });

  it("ignores a non-string anchor value", () => {
    expect(getAnchorId({ id: "text2", anchor: 42 })).toBe("text2");
  });
});
