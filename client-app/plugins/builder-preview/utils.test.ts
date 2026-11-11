import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RouteLocationNormalized } from "vue-router";

const newPageBuilder = vi.hoisted(() => ({ isEnabled: true }));

vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => newPageBuilder.isEnabled }));

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

describe("isPreviewV2Frame", () => {
  beforeEach(() => {
    newPageBuilder.isEnabled = true;
    vi.stubGlobal("parent", {});
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    sessionStorage.clear();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("is true in a frame of the designer that speaks the preview protocol", async () => {
    window.history.replaceState(null, "", "/designer-preview?ep=https%3A%2F%2Fbuilder.example&protocol=2");

    const { isPreviewV2Frame } = await import("./utils");

    expect(isPreviewV2Frame()).toBe(true);
  });

  it("is false in the standalone preview, which is not in a frame", async () => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, "", "/designer-preview?ep=https%3A%2F%2Fbuilder.example&protocol=2");

    const { isPreviewV2Frame } = await import("./utils");

    expect(isPreviewV2Frame()).toBe(false);
  });

  it("is false in a frame opened without the preview protocol, as the Angular designer opens it", async () => {
    window.history.replaceState(null, "", "/designer-preview?ep=https%3A%2F%2Fbuilder.example");

    const { isPreviewV2Frame } = await import("./utils");

    expect(isPreviewV2Frame()).toBe(false);
  });

  it("is false when the New Page Builder is off", async () => {
    newPageBuilder.isEnabled = false;
    window.history.replaceState(null, "", "/designer-preview?ep=https%3A%2F%2Fbuilder.example&protocol=2");

    const { isPreviewV2Frame } = await import("./utils");

    expect(isPreviewV2Frame()).toBe(false);
  });
});

describe("the preview protocol of a reloaded frame", () => {
  const PROTOCOL_2_DESIGNER_URL = `${DESIGNER_URL}&protocol=2`;

  beforeEach(() => {
    newPageBuilder.isEnabled = true;
    vi.stubGlobal("parent", {});
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("keeps the protocol when the frame reloads without it", async () => {
    expect((await boot(PROTOCOL_2_DESIGNER_URL)).isPreviewV2Frame()).toBe(true);

    for (const url of ["/printers?sort=price", "/designer-preview"]) {
      const reloaded = await boot(url);

      expect(reloaded.isOpenedWithPreviewProtocol()).toBe(true);
      expect(reloaded.isPreviewV2Frame()).toBe(true);
    }
  });

  it("takes the protocol of the reloaded URL over the kept one", async () => {
    await boot(PROTOCOL_2_DESIGNER_URL);

    expect((await boot("/designer-preview?protocol=1")).isOpenedWithPreviewProtocol()).toBe(false);
  });

  it("takes the kept protocol only in a frame", async () => {
    await boot(PROTOCOL_2_DESIGNER_URL);
    vi.unstubAllGlobals();

    expect((await boot("/printers")).isOpenedWithPreviewProtocol()).toBe(false);
  });

  it("forgets the kept protocol when the designer loads the frame without it", async () => {
    await boot(PROTOCOL_2_DESIGNER_URL);

    expect((await boot(DESIGNER_URL)).isOpenedWithPreviewProtocol()).toBe(false);
    expect((await boot("/printers")).isOpenedWithPreviewProtocol()).toBe(false);
  });

  it("forgets the kept protocol when the frame loads an endpoint that is not the designer's", async () => {
    await boot(PROTOCOL_2_DESIGNER_URL);

    const invalid = await boot(`/?ep=${encodeURIComponent("javascript:alert(1)")}&protocol=2`);
    expect(invalid.isPreviewV2Frame()).toBe(false);

    expect((await boot("/printers")).isOpenedWithPreviewProtocol()).toBe(false);
  });

  it("does not speak the preview protocol when the frame cannot read its storage", async () => {
    await boot(PROTOCOL_2_DESIGNER_URL);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });

    expect((await boot("/printers")).isOpenedWithPreviewProtocol()).toBe(false);
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
