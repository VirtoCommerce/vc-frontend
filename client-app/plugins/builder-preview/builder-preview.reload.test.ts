import { afterEach, expect, it, vi } from "vitest";
import type { App } from "vue";
import type { Router } from "vue-router";

const BUILDER_ORIGIN = "https://builder.example";
const DESIGNER_URL = "/designer-preview?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F";
const PREVIEW_CATALOG = { sections: {}, protocol: 2 };

vi.mock("@/core/api/common", () => ({ useGlobalInterceptors: () => ({ onRequest: { value: [] } }) }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ normalizeToSupportedCulture: () => undefined }),
}));
vi.mock("@/core/globals", () => ({ globals: {}, setGlobals: vi.fn() }));
vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => true }));
vi.mock("@/shared/static-content", () => ({ useStaticPage: () => ({ staticPagePreview: { value: undefined } }) }));
vi.mock("@/shared/static-content/components", () => ({ templateBlocks: {} }));
vi.mock("./components/preview-page.vue", () => ({ default: { name: "PreviewPage" } }));
vi.mock("./components/scroll-to-element.vue", () => ({ default: {} }));
vi.mock("@/pages/static-page.vue", () => ({ default: { name: "StaticPage" } }));
vi.mock("./preview-v2", () => ({ buildPreviewCatalog: () => PREVIEW_CATALOG, createPreviewV2: vi.fn() }));
vi.mock("./register-components", () => ({ getRegisteredComponents: async () => ({}) }));
vi.mock("./shared-component-overlay", () => ({
  SHARED_COMPONENT_END_ANCHOR_ID: "preview-end",
  normalizeSharedComponentBoundaries: (value: unknown) => value ?? [],
  SharedComponentOverlay: class {
    update = vi.fn();
  },
}));

const addListener = vi.spyOn(window, "addEventListener");

/** A fresh document of the frame at `url`: every load reads the URL and the frame's storage again. */
async function loadFrame(url: string) {
  vi.resetModules();
  window.history.replaceState(null, "", url);
  return {
    plugin: (await import("./builder-preview.plugin")).default,
    utils: await import("./utils"),
  };
}

function frameInDesigner() {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const designer = frame.contentWindow;
  if (!designer) {
    throw new Error("The designer's frame has no window");
  }
  vi.stubGlobal("parent", designer);
  return designer;
}

function createRouter() {
  return {
    getRoutes: () => [{ name: "Matcher" }],
    removeRoute: vi.fn(),
    addRoute: vi.fn(),
    beforeEach: vi.fn(),
    push: vi.fn(),
  } as unknown as Router;
}

afterEach(() => {
  for (const [type, listener] of addListener.mock.calls) {
    if (type === "message") {
      window.removeEventListener(type, listener);
    }
  }
  window.history.replaceState(null, "", "/");
  sessionStorage.clear();
  document.body.replaceChildren();
  document.body.removeAttribute("style");
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("answers the designer's connect after a reload of its frame on a storefront page", async () => {
  const designer = frameInDesigner();
  const postMessage = vi.spyOn(designer, "postMessage").mockImplementation(() => undefined);
  expect((await loadFrame(DESIGNER_URL)).utils.getBuilderOrigin()).toBe(BUILDER_ORIGIN);

  const { plugin, utils } = await loadFrame("/printers");

  expect(utils.getPreviewBootOptions().isActive).toBe(true);

  const router = createRouter();
  await plugin.install({} as App, { router });

  expect(router.addRoute).toHaveBeenCalledWith(expect.objectContaining({ component: { name: "StaticPage" } }));
  expect(router.push).toHaveBeenCalledWith("/designer-preview");

  postMessage.mockClear();
  window.dispatchEvent(
    new MessageEvent("message", {
      origin: BUILDER_ORIGIN,
      source: designer,
      data: { source: "builder", type: "connect", protocol: 2 },
    }),
  );

  await vi.waitFor(() =>
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ source: "preview", type: "loaded" }),
      BUILDER_ORIGIN,
    ),
  );
});

it("sends the preview catalog after a reload of the frame the designer opened with the preview protocol", async () => {
  const designer = frameInDesigner();
  const postMessage = vi.spyOn(designer, "postMessage").mockImplementation(() => undefined);
  expect((await loadFrame(`${DESIGNER_URL}&protocol=2`)).utils.isPreviewV2Frame()).toBe(true);

  const { plugin, utils } = await loadFrame("/printers");

  expect(utils.isPreviewV2Frame()).toBe(true);

  await plugin.install({} as App, { router: createRouter() });

  expect(postMessage).toHaveBeenCalledWith(
    { source: "preview", type: "loaded", data: PREVIEW_CATALOG },
    BUILDER_ORIGIN,
  );
});
