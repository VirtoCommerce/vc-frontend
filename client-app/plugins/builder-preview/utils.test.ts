import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RouteLocationNormalized } from "vue-router";

describe("getBuilderOrigin", () => {
  beforeEach(() => {
    vi.stubGlobal("parent", {});
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("ignores the endpoint when the preview is not in a frame", async () => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F");

    const { getBuilderOrigin } = await import("./utils");

    expect(getBuilderOrigin()).toBeUndefined();
  });

  it("uses only the HTTP endpoint origin", async () => {
    window.history.replaceState(null, "", "/?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F");

    const { getBuilderOrigin } = await import("./utils");

    expect(getBuilderOrigin()).toBe("https://builder.example");
  });

  it.each(["not-a-url", "javascript:alert(1)", "file:///tmp/builder"])(
    "rejects an invalid endpoint: %s",
    async (endpoint) => {
      window.history.replaceState(null, "", `/?ep=${encodeURIComponent(endpoint)}`);

      const { getBuilderOrigin } = await import("./utils");

      expect(getBuilderOrigin()).toBeUndefined();
      vi.resetModules();
    },
  );
});

describe("guardPreviewNavigation", () => {
  function route(fullPath: string) {
    const url = new URL(fullPath, "https://store.example");
    return { path: url.pathname, fullPath, query: {}, hash: url.hash } as unknown as RouteLocationNormalized;
  }

  async function guard(to: string, from: string, allowedNavigation: string | undefined) {
    const { guardPreviewNavigation } = await import("./utils");
    const next = vi.fn();
    guardPreviewNavigation(route(to), route(from), next, allowedNavigation);
    return next.mock.calls[0]?.[0];
  }

  it("shows every page on the preview route for the protocol 1 designer", async () => {
    expect(await guard("/printers", "/designer-preview", undefined)).toMatchObject({ path: "/designer-preview" });
  });

  it("goes to the page the Vue designer showed, and to the preview route", async () => {
    expect(await guard("/printers", "/designer-preview", "/printers")).toBeUndefined();
    expect(await guard("/designer-preview", "/printers", "/printers")).toBeUndefined();
  });

  it("keeps the page the Vue designer showed, except for its own query or hash", async () => {
    expect(await guard("/scanners", "/printers", "/printers")).toBe(false);
    expect(await guard("/printers?sort=price", "/printers", "/printers")).toBe(true);
  });
});
