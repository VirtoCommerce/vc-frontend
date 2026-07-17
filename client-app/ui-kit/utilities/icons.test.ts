import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, it, expect, vi } from "vitest";
import { resolveIconName } from "./icon-aliases";
import { resolveIcon, loadIconRaw, setDefaultIconVariant } from "./icons";

beforeAll(() => {
  // Icons resolve to asset URLs and are fetched at runtime; there is no server
  // under vitest, so serve them from disk.
  vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
    const url = String(input).replace(/^\/@fs/, "");
    const filePath = url.startsWith("/") && !url.startsWith("//") ? path.join(process.cwd(), url) : url;
    try {
      return new Response(await readFile(filePath, "utf8"), { status: 200 });
    } catch {
      return new Response("", { status: 404 });
    }
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

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

  // "accessibility" is a real outline icon unused by other tests, so its memoized
  // loader is unwarmed and this per-test fetch actually runs.
  it("strips scripts and event handlers from the fetched SVG (sanitization is live)", async () => {
    const maliciousSvg =
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect onload="alert(2)" width="10" height="10"/></svg>';
    const diskFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => new Response(maliciousSvg, { status: 200 }));

    try {
      const { raw } = await loadIconRaw("accessibility", "outline");

      expect(raw).not.toContain("<script");
      expect(raw).not.toContain("onload");
      expect(raw).toContain("<svg");
      expect(raw).toContain("<rect");
    } finally {
      globalThis.fetch = diskFetch;
    }
  });

  // "airplay" and "activity" are real outline icons unused elsewhere, so their
  // memoized loaders start cold — the fetch counts below reflect only these tests.
  it("memoizes the loader so the same icon is fetched only once", async () => {
    const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><path d="M1 1"/></svg>';
    const diskFetch = globalThis.fetch;
    const fetchSpy = vi.fn(async () => new Response(validSvg, { status: 200 }));
    globalThis.fetch = fetchSpy;

    try {
      const first = await loadIconRaw("airplay", "outline");
      const second = await loadIconRaw("airplay", "outline");

      expect(first.raw).toContain("<svg");
      expect(second.raw).toContain("<svg");
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = diskFetch;
    }
  });

  it("retries the fetch after a failure (failures are not cached)", async () => {
    const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><path d="M1 1"/></svg>';
    const diskFetch = globalThis.fetch;
    let shouldFail = true;
    const fetchSpy = vi.fn(async () => {
      if (shouldFail) {
        return new Response("", { status: 404 });
      }
      return new Response(validSvg, { status: 200 });
    });
    globalThis.fetch = fetchSpy;

    try {
      const failed = await loadIconRaw("activity", "outline");
      expect(failed.raw).toBe("");

      shouldFail = false;
      const recovered = await loadIconRaw("activity", "outline");

      expect(recovered.raw).toContain("<svg");
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    } finally {
      globalThis.fetch = diskFetch;
    }
  });
});
