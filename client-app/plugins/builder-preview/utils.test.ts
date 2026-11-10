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

describe("isOpenedWithPreviewProtocol", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.resetModules();
  });

  it("is true for the protocol the storefront speaks", async () => {
    window.history.replaceState(null, "", "/?protocol=2");

    const { isOpenedWithPreviewProtocol } = await import("./utils");

    expect(isOpenedWithPreviewProtocol()).toBe(true);
  });

  it.each(["/", "/?protocol=1", "/?protocol=2x"])("is false for %s", async (url) => {
    window.history.replaceState(null, "", url);

    const { isOpenedWithPreviewProtocol } = await import("./utils");

    expect(isOpenedWithPreviewProtocol()).toBe(false);
  });

  it("keeps its answer after the preview route drops the query", async () => {
    window.history.replaceState(null, "", "/?protocol=2");

    const { isOpenedWithPreviewProtocol } = await import("./utils");
    isOpenedWithPreviewProtocol();
    window.history.replaceState(null, "", "/designer-preview");

    expect(isOpenedWithPreviewProtocol()).toBe(true);
  });
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
