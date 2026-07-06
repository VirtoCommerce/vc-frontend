import { describe, it, expect } from "vitest";
import { resolveIcon, loadIconRaw } from "./icons";

describe("resolveIcon", () => {
  it("returns isOutline=false and no loader for empty name", () => {
    expect(resolveIcon()).toEqual({ isOutline: false });
    expect(resolveIcon("")).toEqual({ isOutline: false });
  });

  it("resolves a solid-only icon from solid/", () => {
    const { loader, isOutline } = resolveIcon("academic-cap");
    expect(typeof loader).toBe("function");
    expect(isOutline).toBe(false);
  });

  it("prefers outline when an outline version exists (outline-first)", () => {
    const { loader, isOutline } = resolveIcon("credit-card");
    expect(typeof loader).toBe("function");
    expect(isOutline).toBe(true);
  });

  it("forces solid when variant='solid' even if outline exists", () => {
    const { isOutline } = resolveIcon("credit-card", "solid");
    expect(isOutline).toBe(false);
  });

  it("forces outline when variant='outline'", () => {
    const { isOutline } = resolveIcon("academic-cap", "outline");
    expect(isOutline).toBe(true);
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
    const { raw, isOutline } = await loadIconRaw("__does_not_exist__");
    expect(raw).toBe("");
    expect(isOutline).toBe(false);
  });
});
