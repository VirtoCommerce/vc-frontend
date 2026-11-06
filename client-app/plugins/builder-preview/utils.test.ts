import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RouteLocationNormalized } from "vue-router";

const DESIGNER_URL = "/designer-preview?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F";

/** A fresh document at `url`: every boot reads the URL and the storage again. */
async function boot(url: string) {
  vi.resetModules();
  window.history.replaceState(null, "", url);
  return await import("./utils");
}

/** The designer's first load of the frame, the only URL that carries its endpoint. */
async function loadDesignerFrame() {
  expect((await boot(DESIGNER_URL)).getBuilderOrigin()).toBe("https://builder.example");
}

describe("getBuilderOrigin", () => {
  beforeEach(() => {
    vi.stubGlobal("parent", {});
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("ignores the endpoint when the preview is not in a frame", async () => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F");

    const { getBuilderOrigin } = await import("./utils");

    expect(getBuilderOrigin()).toBeUndefined();
    expect(sessionStorage).toHaveLength(0);
  });

  it("keeps the designer origin when the frame reloads without the endpoint", async () => {
    await loadDesignerFrame();

    expect((await boot("/printers?sort=price")).getBuilderOrigin()).toBe("https://builder.example");
    expect((await boot("/designer-preview")).getBuilderOrigin()).toBe("https://builder.example");
  });

  it("takes the kept origin only in a frame", async () => {
    await loadDesignerFrame();
    vi.unstubAllGlobals();

    expect((await boot("/printers")).getBuilderOrigin()).toBeUndefined();
  });

  it("forgets the kept origin when the frame loads an endpoint that is not the designer's", async () => {
    await loadDesignerFrame();

    expect((await boot(`/?ep=${encodeURIComponent("javascript:alert(1)")}`)).getBuilderOrigin()).toBeUndefined();
    expect((await boot("/printers")).getBuilderOrigin()).toBeUndefined();
  });

  it("is not the designer's preview when the frame cannot read its storage", async () => {
    await loadDesignerFrame();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });

    expect((await boot("/printers")).getBuilderOrigin()).toBeUndefined();
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

describe("getPreviewBootOptions", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    sessionStorage.clear();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("boots a storefront page with the locale prefix and without a preview language", async () => {
    expect((await boot("/printers?cultureName=fr-FR")).getPreviewBootOptions()).toEqual({
      isActive: false,
      cultureName: undefined,
      useLocalePrefix: true,
    });
  });

  it("boots the standalone preview in the page's language, without the locale prefix", async () => {
    expect((await boot("/designer-preview?pageId=page-1&cultureName=fr-FR")).getPreviewBootOptions()).toEqual({
      isActive: true,
      cultureName: "fr-FR",
      useLocalePrefix: false,
    });
  });

  it("boots the designer's frame reloaded on a storefront page as the preview", async () => {
    vi.stubGlobal("parent", {});
    await loadDesignerFrame();

    const reloaded = await boot("/printers");

    expect(reloaded.getPreviewBootOptions()).toEqual({
      isActive: true,
      cultureName: undefined,
      useLocalePrefix: false,
    });
    expect(reloaded.isDesignerPreview()).toBe(true);
  });

  it("boots a frame the designer did not load as a storefront", async () => {
    vi.stubGlobal("parent", {});

    expect((await boot("/printers")).getPreviewBootOptions()).toMatchObject({ isActive: false, useLocalePrefix: true });
  });
});
