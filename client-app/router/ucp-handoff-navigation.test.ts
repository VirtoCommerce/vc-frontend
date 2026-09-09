import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { setGlobals } from "@/core/globals";
import { readUcpContinuation } from "@/shared/checkout/ucp/continuation";
import { createRouter } from "./index";

vi.mock("@/pages/cart.vue", () => ({ default: {} }));
vi.mock("@/pages/sign-in.vue", () => ({ default: {} }));
vi.mock("@/pages/matcher/matcher.vue", () => ({ default: {} }));

const state = vi.hoisted(() => ({
  authenticated: { value: false },
  headers: { value: {} },
  theme: { value: { storeSettings: { anonymousUsersAllowed: false } } },
  notify: vi.fn(),
  merge: vi.fn(),
}));

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/composables")>()),
  useThemeContext: () => ({ themeContext: state.theme }),
}));
vi.mock("@/core/composables/useAuth", () => ({
  useAuth: () => ({ headers: state.headers, isExpired: () => false }),
}));
vi.mock("@/shared/account", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/account")>()),
  useUser: () => ({ isAuthenticated: state.authenticated, organization: { value: undefined } }),
}));
vi.mock("@/core/api/graphql", () => ({
  apolloClient: { mutate: state.merge },
}));
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: state.notify }) }));

describe("UCP navigation using the production route table", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    window.history.replaceState({}, "", "/");
    sessionStorage.clear();
    localStorage.clear();
    state.authenticated.value = false;
    state.headers.value = {};
    state.theme.value.storeSettings.anonymousUsersAllowed = false;
    state.notify.mockReset();
    state.merge.mockReset();
    setGlobals({
      userId: "signed-in-user",
      storeId: "B2B-store",
      currencyCode: "USD",
      cultureName: "en-US",
      i18n: { global: { t: (key: string) => key } } as never,
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => vi.unstubAllGlobals());

  test("keeps the single-use token in this tab through closed-store login and a reload", async () => {
    const router = createRouter({ base: "/" });
    await router.push("/checkout?ucp_session=closed-store-session");
    expect(router.currentRoute.value.name).toBe("SignIn");
    const returnUrl = router.currentRoute.value.query.returnUrl as string;
    expect(returnUrl).not.toContain("closed-store-session");
    const reference = new URL(returnUrl, location.origin).searchParams.get("ucp_resume")!;
    expect(readUcpContinuation(reference)).toBe("closed-store-session");
    expect(fetch).not.toHaveBeenCalled();
    state.authenticated.value = true;
    state.headers.value = { Authorization: "Bearer buyer" };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ checkout: { cart_id: "handoff-cart" } })));
    const reloadedRouter = createRouter({ base: "/" });
    await reloadedRouter.push(returnUrl);
    expect(reloadedRouter.currentRoute.value.params.cartId).toBe("handoff-cart");
    expect(fetch).toHaveBeenCalledOnce();
    expect(readUcpContinuation(reference)).toBeNull();
  });

  test("keeps the existing non-redirectable behavior for ordinary checkout", async () => {
    const router = createRouter({ base: "/" });
    await router.push("/checkout");
    expect(router.currentRoute.value.name).toBe("SignIn");
    expect(router.currentRoute.value.query.returnUrl).toBeUndefined();
  });

  test("protects the real OAuth route even in an open store and preserves state and PKCE", async () => {
    state.theme.value.storeSettings.anonymousUsersAllowed = true;
    const router = createRouter({ base: "/" });
    const continuation =
      "/oauth/authorize?returnUrl=%2Fconnect%2Fauthorize%3Fclient_id%3Dclaude%26state%3Dopaque%2526state%26code_challenge%3Dpkce";
    await router.push(continuation);
    expect(router.currentRoute.value.name).toBe("SignIn");
    expect(router.currentRoute.value.query.returnUrl).toBe(continuation);
  });

  test.each([401, 403])(
    "allows reauthentication after restore status %s despite stale signed-in state",
    async (status) => {
      state.authenticated.value = true;
      state.headers.value = { Authorization: "Bearer rejected-token" };
      vi.mocked(fetch).mockImplementation(async () => new Response("Failure", { status }));
      const router = createRouter({ base: "/" });
      await router.push(`/checkout?ucp_session=status-${status}`);
      expect(router.currentRoute.value.name).toBe("SignIn");
      expect(router.currentRoute.value.query.reauthenticate).toBe("1");
      expect(router.currentRoute.value.query.returnUrl).toContain("ucp_resume=");
      expect(router.currentRoute.value.query.returnUrl).not.toContain(`status-${status}`);
      if (status === 403) {
        expect(state.notify).toHaveBeenCalledWith({ text: "common.ucp.wrong_account" });
      } else {
        expect(state.notify).not.toHaveBeenCalled();
      }
    },
  );

  test.each([400, 503])("shows a local error for restore status %s", async (status) => {
    state.theme.value.storeSettings.anonymousUsersAllowed = true;
    vi.mocked(fetch).mockImplementation(async () => new Response("Failure", { status }));
    const router = createRouter({ base: "/" });
    await router.push(`/checkout?ucp_session=error-${status}`);
    expect(router.currentRoute.value.name).toBe("Cart");
    expect(state.notify).toHaveBeenCalledWith({
      text: status === 400 ? "common.ucp.expired" : "common.ucp.restore_failed",
    });
    expect(fetch).toHaveBeenCalledOnce();
  });

  test("does not restore a token attached to a non-checkout URL", async () => {
    state.theme.value.storeSettings.anonymousUsersAllowed = true;
    const router = createRouter({ base: "/" });
    await router.push("/?ucp_session=not-a-checkout");
    expect(fetch).not.toHaveBeenCalled();
    expect(sessionStorage).toHaveLength(0);
  });

  test("merges an anonymous handoff into the signed-in cart without replacing the user's identity", async () => {
    state.authenticated.value = true;
    state.headers.value = { Authorization: "Bearer buyer" };
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ anonymous_buyer_id: "ucp-anonymous-buyer", checkout: { cart_id: "anonymous-cart" } }),
      ),
    );
    state.merge.mockResolvedValue({ data: { mergeCart: { id: "buyer-cart" } } });
    const router = createRouter({ base: "/" });
    await router.push("/checkout?ucp_session=anonymous-to-user");
    expect(state.merge).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          command: {
            secondCartId: "anonymous-cart",
            userId: "signed-in-user",
            storeId: "B2B-store",
            currencyCode: "USD",
            cultureName: "en-US",
          },
        },
      }),
    );
    expect(router.currentRoute.value.params.cartId).toBe("buyer-cart");
  });
});
