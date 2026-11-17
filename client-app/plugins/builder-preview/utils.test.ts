import { afterEach, describe, expect, it, vi } from "vitest";
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
  await boot(DESIGNER_URL);
  const { getBuilderOrigin } = await import("@/core/theme-snapshot/designer-frame");
  expect(getBuilderOrigin()).toBe("https://builder.example");
}

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

describe("installPageInputGuard", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function guardPage(isPageInputAllowed: () => boolean) {
    const { installPageInputGuard } = await import("./utils");
    document.body.innerHTML = `<a id="link" href="/sale">Sale</a>`;
    const blocker = document.body.appendChild(document.createElement("div"));
    installPageInputGuard(blocker, isPageInputAllowed);

    return { link: document.getElementById("link") as HTMLElement, blocker };
  }

  function dispatch(target: EventTarget, event: Event): boolean {
    target.dispatchEvent(event);
    return event.defaultPrevented;
  }

  it("keeps keys and clicks off a page that takes no input, as protocol 1, and lets Tab and the blocker through", async () => {
    const { link, blocker } = await guardPage(() => false);

    expect(dispatch(link, new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))).toBe(true);
    expect(dispatch(link, new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(true);
    expect(dispatch(link, new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }))).toBe(false);
    expect(dispatch(blocker, new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(false);
  });

  it("leaves input to a page that takes it", async () => {
    const { link } = await guardPage(() => true);

    expect(dispatch(link, new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))).toBe(false);
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
    expect((await import("@/core/theme-snapshot/designer-frame")).isDesignerPreview()).toBe(true);
  });

  it("boots a frame the designer did not load as a storefront", async () => {
    vi.stubGlobal("parent", {});

    expect((await boot("/printers")).getPreviewBootOptions()).toMatchObject({ isActive: false, useLocalePrefix: true });
  });
});
