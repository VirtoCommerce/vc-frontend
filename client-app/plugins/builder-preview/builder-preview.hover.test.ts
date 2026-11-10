import { flushPromises } from "@vue/test-utils";
import { beforeAll, describe, expect, it, vi } from "vitest";
import plugin from "./builder-preview.plugin";
import type { App } from "vue";
import type { Router } from "vue-router";

const state = vi.hoisted(() => ({
  reportPlacementHover: undefined as ((placementId: string | null) => void) | undefined,
}));

vi.mock("@/core/api/common", () => ({ useGlobalInterceptors: () => ({ onRequest: { value: [] } }) }));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ normalizeToSupportedCulture: () => undefined }),
}));
vi.mock("@/core/globals", () => ({ globals: {}, setGlobals: vi.fn() }));
vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => true }));
vi.mock("@/shared/static-content", () => ({ useStaticPage: () => ({ staticPagePreview: { value: undefined } }) }));
vi.mock("@/shared/static-content/components", () => ({ templateBlocks: {} }));
vi.mock("./components/preview-page.vue", () => ({ default: {} }));
vi.mock("./components/scroll-to-element.vue", () => ({ default: {} }));
vi.mock("@/pages/static-page.vue", () => ({ default: {} }));
vi.mock("./preview-v2", () => ({ buildPreviewCatalog: () => ({}), createPreviewV2: () => ({}) }));
vi.mock("./register-components", () => ({ getRegisteredComponents: async () => ({ sections: {} }) }));
vi.mock("./shared-component-overlay", () => ({
  SHARED_COMPONENT_END_ANCHOR_ID: "preview-end",
  normalizeSharedComponentBoundaries: (value: unknown) => value ?? [],
  SharedComponentOverlay: class {
    constructor(_body: HTMLElement, _blocker: HTMLElement, _onSelect: unknown, onHover: (id: string | null) => void) {
      state.reportPlacementHover = onHover;
    }
  },
}));
vi.mock("./utils", () => ({
  getBuilderOrigin: () => "https://builder.example",
  guardPreviewNavigation: vi.fn(),
  installPageInputGuard: vi.fn(),
  isOpenedWithPreviewProtocol: () => true,
  PREVIEW_PROTOCOL: 2,
}));

const router = {
  getRoutes: () => [{ name: "Matcher" }],
  removeRoute: vi.fn(),
  addRoute: vi.fn(),
  beforeEach: vi.fn(),
  push: vi.fn(),
} as unknown as Router;

async function connect(protocol?: number): Promise<void> {
  window.dispatchEvent(
    new MessageEvent("message", {
      origin: "https://builder.example",
      source: window,
      data: { source: "builder", type: "connect", protocol },
    }),
  );
  await flushPromises();
}

function postedHovers(): unknown[] {
  return vi
    .mocked(window.postMessage)
    .mock.calls.map(([message]) => message as { type?: string })
    .filter((message) => message.type === "hover");
}

describe("the preview's placement hover", () => {
  beforeAll(async () => {
    vi.spyOn(window, "postMessage").mockImplementation(() => undefined);
    await plugin.install({} as App, { router });
  });

  it("goes to the protocol 1 designer, and is left to the section outlines under protocol 2", async () => {
    await connect();
    state.reportPlacementHover?.("placement-1");

    expect(postedHovers()).toEqual([{ source: "preview", type: "hover", data: { sectionId: "placement-1" } }]);

    await connect(2);
    state.reportPlacementHover?.(null);

    expect(postedHovers()).toHaveLength(1);
  });
});
