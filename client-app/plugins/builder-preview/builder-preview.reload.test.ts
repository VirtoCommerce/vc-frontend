import { afterEach, expect, it, vi } from "vitest";
import plugin from "./builder-preview.plugin";
import { getPreviewBootOptions } from "./utils";
import type { App } from "vue";
import type { Router } from "vue-router";

const BUILDER_ORIGIN = "https://builder.example";
const DESIGNER_URL = "/designer-preview?ep=https%3A%2F%2Fbuilder.example%2Fdesigner%2F";

vi.mock("@/core/api/common", () => ({ useGlobalInterceptors: () => ({ onRequest: { value: [] } }) }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ normalizeToSupportedCulture: () => undefined }),
}));
vi.mock("@/core/globals", () => ({ globals: {}, setGlobals: vi.fn() }));
vi.mock("@/shared/static-content", () => ({ useStaticPage: () => ({ staticPagePreview: { value: undefined } }) }));
vi.mock("@/shared/static-content/components", () => ({ templateBlocks: {} }));
vi.mock("./components/preview-page.vue", () => ({ default: { name: "PreviewPage" } }));
vi.mock("./components/scroll-to-element.vue", () => ({ default: {} }));
vi.mock("@/pages/static-page.vue", () => ({ default: { name: "StaticPage" } }));
vi.mock("./register-components", () => ({ getRegisteredComponents: async () => ({}) }));
vi.mock("./shared-component-overlay", () => ({
  SHARED_COMPONENT_END_ANCHOR_ID: "preview-end",
  normalizeSharedComponentBoundaries: (value: unknown) => value ?? [],
  SharedComponentOverlay: class {
    update = vi.fn();
  },
}));

const addListener = vi.spyOn(window, "addEventListener");

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
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const designer = frame.contentWindow;
  if (!designer) {
    throw new Error("The designer's frame has no window");
  }
  const postMessage = vi.spyOn(designer, "postMessage").mockImplementation(() => undefined);
  vi.stubGlobal("parent", designer);

  // The designer's first load of the frame runs in a document of its own.
  vi.resetModules();
  window.history.replaceState(null, "", DESIGNER_URL);
  expect((await import("./utils")).getBuilderOrigin()).toBe(BUILDER_ORIGIN);
  window.history.replaceState(null, "", "/printers");

  expect(getPreviewBootOptions().isActive).toBe(true);

  const router = {
    getRoutes: () => [{ name: "Matcher" }],
    removeRoute: vi.fn(),
    addRoute: vi.fn(),
    beforeEach: vi.fn(),
    push: vi.fn(),
  } as unknown as Router;
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
