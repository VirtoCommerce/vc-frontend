import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Logger } from "@/core/utilities";
import plugin from "./builder-preview.plugin";
import type { ConnectTokenResponseType } from "@/core/types";
import type { MockInstance } from "vitest";
import type { App } from "vue";
import type { Router } from "vue-router";

type RequestInterceptorType = (input: unknown, init: { headers: Record<string, string> }) => Promise<void>;
type TokenResultType = { data: ConnectTokenResponseType | null; error: unknown };

const state = vi.hoisted(() => ({
  globals: { userId: "designer", organizationId: undefined as string | undefined },
  getMe: vi.fn<(userId: string) => Promise<{ contact: { organizationId: string } }>>(async () => ({
    contact: { organizationId: "org-1" },
  })),
  fetchWhiteLabelingSettings: vi.fn(async () => undefined),
  onRequest: { value: [] as RequestInterceptorType[] },
  requestToken: vi.fn<(url: string, body: string, contentType: string) => Promise<TokenResultType>>(),
  staticPagePreview: { value: undefined as object | undefined },
}));

vi.mock("@/core/api/common", () => ({
  useGlobalInterceptors: () => ({ onRequest: state.onRequest }),
  useFetch: (url: string) => ({
    post: (body: URLSearchParams, contentType: string) => ({
      json: async () => {
        const { data, error } = await state.requestToken(url, body.toString(), contentType);
        return { data: { value: data }, error: { value: error } };
      },
    }),
  }),
}));
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
vi.mock("@/core/theme-snapshot/enabled", () => ({ isSiteBuilderEnabled: () => false }));
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
vi.mock("@/core/theme-snapshot/designer-frame", () => ({
  getBuilderOrigin: () => "https://builder.example",
  isPreviewV2Frame: () => false,
}));
vi.mock("./utils", () => ({ guardPreviewNavigation: vi.fn(), installPageInputGuard: vi.fn() }));

const router = {
  getRoutes: () => [{ name: "Matcher" }],
  removeRoute: vi.fn(),
  addRoute: vi.fn(),
  beforeEach: vi.fn(),
  push: vi.fn(),
} as unknown as Router;

const PAGE = { settings: {}, content: [] };
const BUILDER_ORIGIN = "https://builder.example";
const EXPIRES_IN_SECONDS = 300;

let postMessage: MockInstance<Window["postMessage"]>;

async function dispatchAuth(data: Record<string, unknown>): Promise<void> {
  window.dispatchEvent(
    new MessageEvent("message", {
      origin: BUILDER_ORIGIN,
      source: window,
      data: { source: "builder", type: "auth", ...data },
    }),
  );
  await flushPromises();
}

async function sendAuth(userId: string | null, accessToken = `token-${userId}`): Promise<void> {
  await dispatchAuth({ token: userId ? { access_token: accessToken } : null, userId });
}

async function sendCode(userId: string, code = `code-${userId}`): Promise<void> {
  await dispatchAuth({ code, userId });
}

function issueToken(accessToken: string): void {
  state.requestToken.mockResolvedValueOnce({
    data: { access_token: accessToken, token_type: "Bearer", expires_in: EXPIRES_IN_SECONDS },
    error: null,
  });
}

function getAuthRenewMessages(): unknown[][] {
  return postMessage.mock.calls.filter(([message]) => (message as { type?: string }).type === "authRenew");
}

async function getRequestAuthorization(): Promise<string | undefined> {
  const init = { headers: {} as Record<string, string> };
  await state.onRequest.value[0]("/graphql", init);
  return init.headers.Authorization;
}

describe("the preview's auth message", () => {
  beforeAll(async () => {
    postMessage = vi.spyOn(window, "postMessage").mockImplementation(() => undefined);
    await plugin.install({} as App, { router });
  });

  beforeEach(async () => {
    await sendAuth(null);
    state.getMe.mockClear();
    state.fetchWhiteLabelingSettings.mockClear();
    state.requestToken.mockReset();
    postMessage.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("signs requests with a token the designer sends as is, without an exchange or a renewal request", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    await sendAuth("customer");
    await vi.advanceTimersByTimeAsync(EXPIRES_IN_SECONDS * 1000);

    expect(await getRequestAuthorization()).toBe("Bearer token-customer");
    expect(state.requestToken).not.toHaveBeenCalled();
    expect(getAuthRenewMessages()).toHaveLength(0);
  });

  it("previews the user with the token it gets for the code at the storefront's own token endpoint", async () => {
    issueToken("storefront-token");

    await sendCode("customer", "one-time-code");

    expect(state.requestToken).toHaveBeenCalledExactlyOnceWith(
      "/connect/token",
      "grant_type=site_builder_preview&code=one-time-code",
      "application/x-www-form-urlencoded",
    );
    expect(await getRequestAuthorization()).toBe("Bearer storefront-token");
    expect(state.globals).toEqual({ userId: "customer", organizationId: "org-1" });
    expect(getAuthRenewMessages()).toHaveLength(0);
  });

  it("renders anonymously and asks the designer for a new code when the exchange fails", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await sendAuth("customer");
    state.requestToken.mockResolvedValueOnce({ data: { error: "invalid_grant" }, error: new Error("Bad Request") });

    await sendCode("colleague");
    await vi.advanceTimersByTimeAsync(0);

    expect(await getRequestAuthorization()).toBeUndefined();
    expect(state.globals).toEqual({ userId: "designer", organizationId: undefined });
    expect(postMessage).toHaveBeenCalledWith(
      { source: "preview", type: "authRenew", data: { userId: "colleague" } },
      BUILDER_ORIGIN,
    );
  });

  it("renders anonymously and asks for a new code when the token endpoint cannot be reached", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const fetchError = new TypeError("Failed to fetch");
    const logError = vi.spyOn(Logger, "error").mockImplementation(() => undefined);
    state.requestToken.mockResolvedValueOnce({ data: null, error: fetchError });

    await sendCode("customer");
    await vi.advanceTimersByTimeAsync(0);

    expect(logError).toHaveBeenCalledWith("[builder-preview] Failed to exchange the preview code", fetchError);
    logError.mockRestore();
    expect(await getRequestAuthorization()).toBeUndefined();
    expect(state.globals).toEqual({ userId: "designer", organizationId: undefined });
    expect(getAuthRenewMessages()).toEqual([
      [{ source: "preview", type: "authRenew", data: { userId: "customer" } }, BUILDER_ORIGIN],
    ]);
  });

  it("drops the renewal request of a failed exchange when the designer sends another auth first", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    state.requestToken.mockResolvedValueOnce({ data: { error: "invalid_grant" }, error: new Error("Bad Request") });

    await sendCode("customer");
    await sendAuth(null);
    await vi.advanceTimersByTimeAsync(0);

    expect(getAuthRenewMessages()).toHaveLength(0);
  });

  it("asks for a new code 60 seconds before the exchanged token expires", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    issueToken("storefront-token");

    await sendCode("customer");
    await vi.advanceTimersByTimeAsync((EXPIRES_IN_SECONDS - 60) * 1000 - 1);

    expect(getAuthRenewMessages()).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(1);

    expect(getAuthRenewMessages()).toEqual([
      [{ source: "preview", type: "authRenew", data: { userId: "customer" } }, BUILDER_ORIGIN],
    ]);
  });

  it("swaps in the renewed token without loading the page again and schedules the next renewal", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    issueToken("storefront-token");
    await sendCode("customer");
    state.staticPagePreview.value = PAGE;
    state.getMe.mockClear();
    issueToken("renewed-token");

    await vi.advanceTimersByTimeAsync((EXPIRES_IN_SECONDS - 60) * 1000);
    await sendCode("customer", "renewal-code");
    await vi.advanceTimersByTimeAsync((EXPIRES_IN_SECONDS - 60) * 1000);

    expect(await getRequestAuthorization()).toBe("Bearer renewed-token");
    expect(state.staticPagePreview.value).toBe(PAGE);
    expect(state.getMe).not.toHaveBeenCalled();
    expect(getAuthRenewMessages()).toHaveLength(2);
  });

  it("drops the pending renewal when the designer switches to an anonymous visitor", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    issueToken("storefront-token");
    await sendCode("customer");

    await sendAuth(null);
    await vi.advanceTimersByTimeAsync(EXPIRES_IN_SECONDS * 1000);

    expect(await getRequestAuthorization()).toBeUndefined();
    expect(state.globals).toEqual({ userId: "designer", organizationId: undefined });
    expect(getAuthRenewMessages()).toHaveLength(0);
  });
});
