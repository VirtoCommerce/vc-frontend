import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ref } from "vue";
import AuthorizePage from "./authorize.vue";

const continuation = "/connect/authorize?client_id=claude&state=opaque%26state&code_challenge=pkce";
const query: { returnUrl: string | string[] | undefined } = { returnUrl: undefined };
const fullPath = "/oauth/authorize?returnUrl=" + encodeURIComponent(continuation);
const replace = vi.fn();
const navigate = vi.fn();
const error = ref<Error>();
const tokenError = ref<Error>();
const tokenData = ref<{ requestToken: string }>();
const statusCode = ref<number | null>(200);
const tokenStatus = ref<number | null>(200);
const json = vi.fn(async () => ({ data: tokenData, error: tokenError, statusCode: tokenStatus }));
const get = vi.fn(() => ({ json }));
const post = vi.fn(async () => ({ error, statusCode }));
const fetch = vi.fn<(...args: unknown[]) => { post: typeof post; get: typeof get }>(() => ({ post, get }));

vi.mock("vue-router", () => ({ useRoute: () => ({ query, fullPath }), useRouter: () => ({ replace }) }));
vi.mock("@/core/api/common", () => ({ useFetch: (...args: unknown[]) => fetch(...args) }));
vi.mock("@/core/utilities", async () => await import("@/core/utilities/same-origin"));

describe("storefront OAuth continuation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    error.value = undefined;
    tokenError.value = undefined;
    tokenData.value = { requestToken: "csrf-token" };
    statusCode.value = 200;
    tokenStatus.value = 200;
    query.returnUrl = continuation;
    vi.stubGlobal("location", { origin: "https://shop.example", replace: navigate });
  });
  afterEach(() => vi.unstubAllGlobals());

  async function openPage() {
    const wrapper = mount(AuthorizePage, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          VcLoaderOverlay: true,
          VcEmptyPage: { template: "<div><slot /></div>" },
          VcTypography: { template: "<h1><slot /></h1>" },
          VcButton: true,
        },
      },
    });
    await flushPromises();
    const text = wrapper.text();
    wrapper.unmount();
    return text;
  }

  test("establishes the browser session and suppresses global error broadcasts for both requests", async () => {
    await openPage();
    expect(fetch).toHaveBeenCalledWith(
      `/connect/session?${new URLSearchParams({ returnUrl: continuation })}`,
      { headers: { RequestVerificationToken: "csrf-token" } },
      { onFetchError: expect.any(Function) },
    );
    expect(fetch).toHaveBeenCalledWith("/connect/session", { headers: {} }, { onFetchError: expect.any(Function) });
    for (const call of fetch.mock.calls) {
      const options = call[2] as { onFetchError: (context: unknown) => unknown };
      const context = { response: { status: 403 }, error: new Error("Forbidden") };
      expect(options.onFetchError(context)).toBe(context);
    }
    expect(navigate).toHaveBeenCalledWith(continuation);
    expect(replace).not.toHaveBeenCalled();
  });

  test.each([
    undefined,
    [continuation, continuation],
    "https://other.example/connect/authorize?state=x",
    "//other.example/connect/authorize?state=x",
    "/api/platform/security/users?state=x",
    "/connect/authorize?state=x#fragment",
  ])("shows a continuation error for unsafe or ambiguous returnUrl %s", async (returnUrl) => {
    query.returnUrl = returnUrl;
    expect(await openPage()).toContain("common.ucp.authorization_failed");
    expect(fetch).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  test.each([400, 403, 404, 500])(
    "shows a continuation error for session status %s without navigating to the banned-user page",
    async (status) => {
      error.value = new Error("Session failed");
      statusCode.value = status;
      expect(await openPage()).toContain("common.ucp.authorization_failed");
      expect(navigate).not.toHaveBeenCalled();
      expect(replace).not.toHaveBeenCalled();
    },
  );

  test.each(["get", "post"])("preserves the full continuation when %s returns 401", async (method) => {
    if (method === "get") {
      tokenError.value = new Error("Unauthorized");
      tokenStatus.value = 401;
    } else {
      error.value = new Error("Unauthorized");
      statusCode.value = 401;
    }
    await openPage();
    expect(replace).toHaveBeenCalledWith({ name: "SignIn", query: { returnUrl: fullPath, reauthenticate: "1" } });
    expect(navigate).not.toHaveBeenCalled();
    if (method === "get") {
      expect(post).not.toHaveBeenCalled();
    }
  });

  test.each([true, false])("does not create a session without antiforgery data (failed GET: %s)", async (failed) => {
    if (failed) {
      tokenError.value = new Error("Failed");
      tokenStatus.value = 500;
    } else {
      tokenData.value = undefined;
    }
    expect(await openPage()).toContain("common.ucp.authorization_failed");
    expect(post).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
