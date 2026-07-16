import { afterEach, describe, it, expect } from "vitest";
import { resolveIconName } from "./icon-aliases";
import { resolveIcon, loadIconRaw, setDefaultIconVariant } from "./icons";

afterEach(() => {
  setDefaultIconVariant("outline");
});

describe("resolveIconName", () => {
  it("maps a legacy alias to its canonical Lucide name", () => {
    expect(resolveIconName("cube")).toBe("box");
  });

  it("passes a non-aliased name through unchanged", () => {
    expect(resolveIconName("box")).toBe("box");
  });
});

describe("resolveIcon", () => {
  it("returns isOutline=false and no loader for empty name", () => {
    expect(resolveIcon()).toEqual({ isOutline: false });
    expect(resolveIcon("")).toEqual({ isOutline: false });
  });

  it.each([
    ["information-circle", true],
    ["cube", true],
    ["credit-card", true],
    ["outline-security", false],
  ])("resolves %s to a loader with isOutline=%s", (name, expectedOutline) => {
    const { loader, isOutline } = resolveIcon(name);
    expect(typeof loader).toBe("function");
    expect(isOutline).toBe(expectedOutline);
  });

  it("uses the solid glyph when variant='solid' and a solid file exists", () => {
    const { isOutline } = resolveIcon("information-circle", "solid");
    expect(isOutline).toBe(false);
  });

  it("honors an explicit variant prop over the default", () => {
    setDefaultIconVariant("solid");
    expect(resolveIcon("information-circle", "outline").isOutline).toBe(true);
  });
});

describe("setDefaultIconVariant", () => {
  it("switches the default resolution to solid", () => {
    setDefaultIconVariant("solid");
    expect(resolveIcon("information-circle").isOutline).toBe(false);
  });

  it("switches the default resolution back to outline", () => {
    setDefaultIconVariant("solid");
    setDefaultIconVariant("outline");
    expect(resolveIcon("information-circle").isOutline).toBe(true);
  });
});

describe("loadIconRaw", () => {
  it("returns empty raw and isOutline=false for missing name", async () => {
    expect(await loadIconRaw()).toEqual({ raw: "", isOutline: false });
  });

  it("loads and sanitizes an outline icon", async () => {
    const { raw, isOutline } = await loadIconRaw("credit-card");
    expect(isOutline).toBe(true);
    expect(raw).toContain("<svg");
    expect(raw).toContain("stroke");
  });

  it("returns empty raw for an unknown icon name", async () => {
    const { raw } = await loadIconRaw("__does_not_exist__");
    expect(raw).toBe("");
  });
});
