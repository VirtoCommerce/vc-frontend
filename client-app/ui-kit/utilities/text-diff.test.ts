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

  // A repeated character is where a naive substring search goes wrong: "aa" contains "a" twice,
  // so removing the first occurrence would be indistinguishable from removing the inserted one.
  it("handles a repeated character", () => {
    expect(insertedText("aa", "aaa")).toBe("a");
  });
});
