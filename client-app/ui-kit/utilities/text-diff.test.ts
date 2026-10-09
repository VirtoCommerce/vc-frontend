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

  // Typing over a selected label replaces it, so nothing on either side is shared.
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

  // What a before/after diff cannot tell apart: the typed text matches what it replaced at an edge.
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

  // A repeated character is where a naive substring search goes wrong: "aa" contains "a" twice,
  // so removing the first occurrence would be indistinguishable from removing the inserted one.
  it("handles a repeated character", () => {
    expect(insertedText("aa", "aaa")).toBe("a");
  });
});
