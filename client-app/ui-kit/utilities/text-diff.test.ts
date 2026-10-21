import { describe, expect, it } from "vitest";
import { insertedText } from "./text-diff";

describe("insertedText", () => {
  it("returns the whole value when the field was empty", () => {
    expect(insertedText("", "bel")).toBe("bel");
  });

  it("returns the character appended to a label", () => {
    expect(insertedText("Belgium", "Belgiumc")).toBe("c");
  });

  it("returns the character inserted in the middle of a label", () => {
    expect(insertedText("Belgium", "Belgxium")).toBe("x");
  });

  it("returns the character inserted before a label", () => {
    expect(insertedText("Belgium", "xBelgium")).toBe("x");
  });

  it("returns a whole pasted run, not just one character", () => {
    expect(insertedText("Belgium", "Belgiumchi")).toBe("chi");
  });

  it.each([
    ["one character", "c"],
    ["a pasted run", "chi"],
  ])("returns %s typed over the whole label", (_label, typed) => {
    expect(insertedText("Belgium", typed)).toBe(typed);
  });

  it("returns the text typed over part of a label", () => {
    expect(insertedText("Belgium", "Bechi")).toBe("chi");
  });

  it("returns nothing for an unchanged value", () => {
    expect(insertedText("Belgium", "Belgium")).toBe("");
  });

  it("returns nothing for a deletion", () => {
    expect(insertedText("Belgium", "Belgiu")).toBe("");
  });

  describe("with the replaced selection", () => {
    it.each([
      ["the label's first character over the whole label", "Belgium", "B", [0, 7], "B"],
      ["the label's last character over the whole label", "Germany", "y", [0, 7], "y"],
      ["a pasted run over the whole label", "Belgium", "Bel", [0, 7], "Bel"],
      ["a character over part of the label", "Belgium", "Bxium", [1, 4], "x"],
      ["a character at a caret inside the label", "Belgium", "Belgxium", [4, 4], "x"],
      ["a character at the caret after the label", "Belgium", "Belgiumm", [7, 7], "m"],
    ] as const)("returns %s", (_label, previous, next, replaced, inserted) => {
      expect(insertedText(previous, next, replaced)).toBe(inserted);
    });

    it.each([
      ["Backspace at the end", "Belgium", "Belgiu", [7, 7]],
      ["Delete over the whole label", "Belgium", "", [0, 7]],
      ["Delete over part of the label", "Belgium", "Bgium", [1, 3]],
    ] as const)("returns nothing for %s", (_label, previous, next, replaced) => {
      expect(insertedText(previous, next, replaced)).toBe("");
    });
  });

  it("handles a repeated character", () => {
    expect(insertedText("aa", "aaa")).toBe("a");
  });

  it.each([
    ["sharing a leading surrogate with the next one", "😀😀", "😀😃😀", "😃"],
    ["replacing one that shares its leading surrogate", "a😀", "a😃", "😃"],
    ["replacing one that shares its trailing surrogate", "a😀", "a\u{1FA00}", "\u{1FA00}"],
    ["at the bottom of the leading-surrogate range", "a\u{10000}", "a\u{10001}", "\u{10001}"],
    ["at the top of the leading-surrogate range", "a\u{10FFFC}", "a\u{10FFFD}", "\u{10FFFD}"],
    ["at the bottom of the trailing-surrogate range", "a\u{10000}", "a\u{10400}", "\u{10400}"],
    ["at the top of the trailing-surrogate range", "a\u{103FF}", "a\u{107FF}", "\u{107FF}"],
  ])("returns a whole emoji %s", (_label, previous, next, inserted) => {
    expect(insertedText(previous, next)).toBe(inserted);
  });
});
