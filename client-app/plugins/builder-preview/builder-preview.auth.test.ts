import { flushPromises } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import plugin from "./builder-preview.plugin";
import type { App } from "vue";
import type { Router } from "vue-router";

type RequestInterceptorType = (input: unknown, init: { headers: Record<string, string> }) => Promise<void>;

const state = vi.hoisted(() => ({
  globals: { userId: "designer", organizationId: undefined as string | undefined },
  getMe: vi.fn<(userId: string) => Promise<{ contact: { organizationId: string } }>>(async () => ({
    contact: { organizationId: "org-1" },
  })),
  fetchWhiteLabelingSettings: vi.fn(async () => undefined),
  onRequest: { value: [] as RequestInterceptorType[] },
  staticPagePreview: { value: undefined as object | undefined },
}));

vi.mock("@/core/api/common", () => ({ useGlobalInterceptors: () => ({ onRequest: state.onRequest }) }));
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
vi.mock("@/shared/static-content", () => ({
  useStaticPage: () => ({ staticPagePreview: state.staticPagePreview }),
}));
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
  installPageInputGuard: vi.fn(),
  isOpenedWithPreviewProtocol: () => false,
}));

const router = {
  getRoutes: () => [{ name: "Matcher" }],
  removeRoute: vi.fn(),
  addRoute: vi.fn(),
  beforeEach: vi.fn(),
  push: vi.fn(),
} as unknown as Router;

const PAGE = { settings: {}, content: [] };

async function sendAuth(userId: string | null, accessToken = `token-${userId}`): Promise<void> {
  window.dispatchEvent(
    new MessageEvent("message", {
      origin: "https://builder.example",
      source: window,
      data: { source: "builder", type: "auth", token: userId ? { access_token: accessToken } : null, userId },
    }),
  );
  await flushPromises();
}

async function getRequestAuthorization(): Promise<string | undefined> {
  const init = { headers: {} as Record<string, string> };
  await state.onRequest.value[0]("/graphql", init);
  return init.headers.Authorization;
}

describe("the preview's auth message", () => {
  beforeAll(async () => {
    vi.spyOn(window, "postMessage").mockImplementation(() => undefined);
    await plugin.install({} as App, { router });
  });

  beforeEach(async () => {
    await sendAuth(null);
    state.getMe.mockClear();
    state.fetchWhiteLabelingSettings.mockClear();
  });

  it("previews the user's organization with its branding, then gives the designer's back", async () => {
    await sendAuth("customer");

    expect(state.getMe).toHaveBeenCalledWith("customer");
    expect(state.globals).toEqual({ userId: "customer", organizationId: "org-1" });
    expect(state.fetchWhiteLabelingSettings).toHaveBeenCalledOnce();

    await sendAuth("colleague");

    expect(state.globals).toEqual({ userId: "colleague", organizationId: "org-1" });
    expect(state.fetchWhiteLabelingSettings).toHaveBeenCalledOnce();

    await sendAuth(null);

    expect(state.globals).toEqual({ userId: "designer", organizationId: undefined });
    expect(state.fetchWhiteLabelingSettings).toHaveBeenCalledTimes(2);
  });

  it("signs requests with a renewed token without loading the page or the user's organization again", async () => {
    await sendAuth("customer");
    state.staticPagePreview.value = PAGE;
    state.getMe.mockClear();
    state.fetchWhiteLabelingSettings.mockClear();

    await sendAuth("customer", "token-renewed");

    expect(await getRequestAuthorization()).toBe("Bearer token-renewed");
    expect(state.staticPagePreview.value).toBe(PAGE);
    expect(state.globals).toEqual({ userId: "customer", organizationId: "org-1" });
    expect(state.getMe).not.toHaveBeenCalled();
    expect(state.fetchWhiteLabelingSettings).not.toHaveBeenCalled();

    await sendAuth(null);

    expect(await getRequestAuthorization()).toBeUndefined();
    expect(state.staticPagePreview.value).toBeUndefined();
  });

  it("loads the page again when a message for the same user comes without a token", async () => {
    await sendAuth("customer");
    state.staticPagePreview.value = PAGE;

    await sendAuth("customer", "");

    expect(await getRequestAuthorization()).toBeUndefined();
    expect(state.staticPagePreview.value).toBeUndefined();
  });
});
