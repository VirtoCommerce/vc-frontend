import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAnchorId, scrollToAnchor, slugifyAnchor } from "./anchors";

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

describe("scrollToAnchor", () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;

  function addSection(id: string) {
    const section = document.createElement("div");
    section.id = id;
    document.body.appendChild(section);
    return section;
  }

  beforeEach(() => {
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    // jsdom exposes scrollY as a getter, so make it assignable to simulate the visitor scrolling.
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true, writable: true });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("scrolls to a section that is already rendered", async () => {
    addSection("specifications");

    await expect(scrollToAnchor("#specifications")).resolves.toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("finds an <a name> anchor authored inside rich text", async () => {
    const anchor = document.createElement("a");
    anchor.setAttribute("name", "chapter-one");
    document.body.appendChild(anchor);

    await expect(scrollToAnchor("#chapter-one")).resolves.toBe(true);
  });

  it("waits for a section that mounts asynchronously", async () => {
    const pending = scrollToAnchor("#products", 2000);
    setTimeout(() => addSection("products"), 50);

    await expect(pending).resolves.toBe(true);
    expect(scrollIntoView).toHaveBeenCalledOnce();
  });

  it("gives up once the budget is spent instead of hanging", async () => {
    await expect(scrollToAnchor("#never-rendered", 30)).resolves.toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("stops chasing the anchor once the visitor scrolls themselves", async () => {
    const pending = scrollToAnchor("#products", 5000);
    setTimeout(() => (window.scrollY = 400), 30);

    await expect(pending).resolves.toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("does nothing without a hash", async () => {
    await expect(scrollToAnchor("")).resolves.toBe(false);
    await expect(scrollToAnchor("#")).resolves.toBe(false);
  });

  it("survives a malformed percent escape in the hash", async () => {
    await expect(scrollToAnchor("#broken%", 30)).resolves.toBe(false);
  });

  it("decodes a percent-encoded anchor", async () => {
    addSection("side-by-side");

    await expect(scrollToAnchor("#side%2Dby%2Dside", 500)).resolves.toBe(true);
  });
});
