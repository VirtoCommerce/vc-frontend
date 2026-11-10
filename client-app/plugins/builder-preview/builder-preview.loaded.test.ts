import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import plugin from "./builder-preview.plugin";
import type { App } from "vue";
import type { Router } from "vue-router";

const state = vi.hoisted(() => ({
  isEnabled: false,
  isProtocolRequested: false,
  schemas: { sections: {} },
  catalog: { sections: {}, protocol: 2 },
}));

vi.mock("@/core/api/common", () => ({ useGlobalInterceptors: () => ({ onRequest: { value: [] } }) }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ normalizeToSupportedCulture: () => undefined }),
}));
vi.mock("@/core/globals", () => ({ globals: {}, setGlobals: vi.fn() }));
vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => state.isEnabled }));
vi.mock("@/shared/static-content", () => ({ useStaticPage: () => ({ staticPagePreview: { value: undefined } }) }));
vi.mock("@/shared/static-content/components", () => ({ templateBlocks: {} }));
vi.mock("./components/preview-page.vue", () => ({ default: {} }));
vi.mock("./components/scroll-to-element.vue", () => ({ default: {} }));
vi.mock("@/pages/static-page.vue", () => ({ default: {} }));
vi.mock("./preview-v2", () => ({ buildPreviewCatalog: () => state.catalog, createPreviewV2: vi.fn() }));
vi.mock("./register-components", () => ({ getRegisteredComponents: async () => state.schemas }));
vi.mock("./shared-component-overlay", () => ({
  SHARED_COMPONENT_END_ANCHOR_ID: "preview-end",
  normalizeSharedComponentBoundaries: (value: unknown) => value ?? [],
  SharedComponentOverlay: class {},
}));
vi.mock("./utils", () => ({
  getBuilderOrigin: () => "https://builder.example",
  guardPreviewNavigation: vi.fn(),
  installPageInputGuard: vi.fn(),
  isOpenedWithPreviewProtocol: () => state.isProtocolRequested,
}));

describe("the preview's loaded message", () => {
  const router = {
    getRoutes: () => [{ name: "Matcher" }],
    removeRoute: vi.fn(),
    addRoute: vi.fn(),
    beforeEach: vi.fn(),
    push: vi.fn(),
  } as unknown as Router;

  beforeEach(() => {
    vi.spyOn(window, "postMessage").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    { isEnabled: true, isProtocolRequested: true, expected: "catalog" as const },
    { isEnabled: true, isProtocolRequested: false, expected: "schemas" as const },
    { isEnabled: false, isProtocolRequested: true, expected: "schemas" as const },
  ])(
    "sends the $expected with the flag $isEnabled and the protocol requested $isProtocolRequested",
    async ({ isEnabled, isProtocolRequested, expected }) => {
      state.isEnabled = isEnabled;
      state.isProtocolRequested = isProtocolRequested;

      await plugin.install({} as App, { router });

      expect(window.postMessage).toHaveBeenCalledWith(
        { source: "preview", type: "loaded", data: expected === "catalog" ? state.catalog : state.schemas },
        "https://builder.example",
      );
    },
  );
});
