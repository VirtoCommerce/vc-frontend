import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import plugin from "./builder-preview.plugin";
import type { App } from "vue";
import type { Router } from "vue-router";

const state = vi.hoisted(() => ({
  globals: { userId: "designer", organizationId: undefined as string | undefined },
  getMe: vi.fn<(userId: string) => Promise<{ contact: { organizationId: string } }>>(async () => ({
    contact: { organizationId: "org-1" },
  })),
  fetchWhiteLabelingSettings: vi.fn(async () => undefined),
}));

vi.mock("@/core/api/common", () => ({ useGlobalInterceptors: () => ({ onRequest: { value: [] } }) }));
vi.mock("@/core/api/graphql/account/queries/getMe", () => ({ getMe: state.getMe }));
vi.mock("@/core/composables/useWhiteLabeling", () => ({
  useWhiteLabeling: () => ({ fetchWhiteLabelingSettings: state.fetchWhiteLabelingSettings }),
}));
vi.mock("@/core/composables/useLanguages", () => ({
  useLanguages: () => ({ normalizeToSupportedCulture: () => undefined }),
}));
vi.mock("@/core/globals", () => ({
  globals: state.globals,
  setGlobals: (patch: object) => Object.assign(state.globals, patch),
}));
vi.mock("@/core/theme-snapshot/enabled", () => ({ isNewPageBuilderEnabled: () => false }));
vi.mock("@/shared/static-content", () => ({ useStaticPage: () => ({ staticPagePreview: { value: undefined } }) }));
vi.mock("@/shared/static-content/components", () => ({ templateBlocks: {} }));
vi.mock("./components/preview-page.vue", () => ({ default: {} }));
vi.mock("./components/scroll-to-element.vue", () => ({ default: {} }));
vi.mock("@/pages/static-page.vue", () => ({ default: {} }));
vi.mock("./preview-v2", () => ({ buildPreviewCatalog: vi.fn(), createPreviewV2: vi.fn() }));
vi.mock("./register-components", () => ({ getRegisteredComponents: async () => ({ sections: {} }) }));
vi.mock("./shared-component-overlay", () => ({
  SHARED_COMPONENT_END_ANCHOR_ID: "preview-end",
  normalizeSharedComponentBoundaries: (value: unknown) => value ?? [],
  SharedComponentOverlay: class {},
}));
vi.mock("./utils", () => ({
  getBuilderOrigin: () => "https://builder.example",
  guardPreviewNavigation: vi.fn(),
  isOpenedWithPreviewProtocol: () => false,
}));

const router = {
  getRoutes: () => [{ name: "Matcher" }],
  removeRoute: vi.fn(),
  addRoute: vi.fn(),
  beforeEach: vi.fn(),
  push: vi.fn(),
} as unknown as Router;

async function sendAuth(userId: string | null): Promise<void> {
  const token = userId ? { access_token: `token-${userId}` } : null;
  window.dispatchEvent(
    new MessageEvent("message", {
      origin: "https://builder.example",
      source: window,
      data: { source: "builder", type: "auth", token, userId },
    }),
  );
  await flushPromises();
}

describe("the preview's auth message", () => {
  it("previews the user's organization with its branding, then gives the designer's back", async () => {
    vi.spyOn(window, "postMessage").mockImplementation(() => undefined);
    await plugin.install({} as App, { router });

    await sendAuth("customer");

    expect(state.getMe).toHaveBeenCalledWith("customer");
    expect(state.globals).toEqual({ userId: "customer", organizationId: "org-1" });
    expect(state.fetchWhiteLabelingSettings).toHaveBeenCalledOnce();

    await sendAuth("customer");

    expect(state.fetchWhiteLabelingSettings).toHaveBeenCalledOnce();

    await sendAuth(null);

    expect(state.globals).toEqual({ userId: "designer", organizationId: undefined });
    expect(state.fetchWhiteLabelingSettings).toHaveBeenCalledTimes(2);
  });
});
