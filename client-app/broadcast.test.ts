import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { ROUTES } from "@/router/routes/constants";
import {
  cartReloadEvent,
  forbiddenEvent,
  graphqlErrorEvent,
  passwordExpiredEvent,
  unauthorizedErrorEvent,
} from "@/shared/broadcast";
import { setupBroadcastGlobalListeners } from "./broadcast";
import type { INotification } from "@/shared/notification";
import type { GraphQLFormattedError } from "graphql";
import type { NavigationHookAfter, RouteLocationRaw, Router } from "vue-router";

const h = vi.hoisted(() => {
  const user: { value: Record<string, unknown> } = { value: {} };

  return {
    listeners: new Map<string, (data?: unknown) => unknown>(),
    notifyError: vi.fn(),
    report: vi.fn(),
    router: {
      currentRoute: { value: {} },
      push: vi.fn(),
      replace: vi.fn(),
      afterEach: vi.fn<(hook: NavigationHookAfter) => void>(),
      onError: vi.fn<Router["onError"]>(),
    },
    client: { refetchQueries: vi.fn(), cache: { gc: vi.fn() } },
    closeAllModals: vi.fn(),
    authHeaders: { value: {} },
    fetchUser: vi.fn(),
    user,
    // As in `useUser`: derived from the loaded user, so a reload is what changes it
    isAuthenticated: {
      get value() {
        return !!user.value.userName && user.value.userName !== "Anonymous";
      },
    },
  };
});

vi.mock("@vue/apollo-composable", () => ({ useApolloClient: () => ({ client: h.client }) }));
vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRouter: () => h.router,
}));
vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/core/globals", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/core/globals")>();
  return { ...actual, globals: { ...actual.globals, i18n: { global: { t: (key: string) => key } } } };
});
vi.mock("@/core/composables", () => ({
  useAuth: () => ({ headers: h.authHeaders }),
  useReturnUrl: () => ({ getReturnUrl: vi.fn() }),
  useSupportReports: () => ({ report: h.report }),
}));
vi.mock("@/core/api/graphql", async () => ({
  filterActiveQueryNames: vi.fn(),
  getFieldValidationErrors: (await import("@/core/api/graphql/utils")).getFieldValidationErrors,
}));
vi.mock("@/shared/account", () => ({
  useUser: () => ({ fetchUser: h.fetchUser, user: h.user, isAuthenticated: h.isAuthenticated }),
  useSignMeOut: () => ({ signMeOut: vi.fn() }),
}));
vi.mock("@/shared/broadcast", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/broadcast")>()),
  useBroadcast: () => ({
    on: (event: string, listener: (data: unknown) => void) => h.listeners.set(event, listener),
  }),
}));
vi.mock("@/shared/common", async () => ({
  useFieldErrors: (await import("@/shared/common/composables/useFieldErrors")).useFieldErrors,
}));
vi.mock("@/shared/modal", () => ({ closeAllModals: h.closeAllModals }));
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: h.notifyError, update: vi.fn() }) }));

beforeAll(() => {
  setupBroadcastGlobalListeners();
});

beforeEach(() => {
  h.authHeaders.value = { Authorization: "Bearer token" };
  h.fetchUser.mockReset();
  h.user.value = {};
});

// As in `useBroadcast`: emitters don't wait for the listener, so the next step runs while it may still be waiting for
// `me`, and a listener that rejects is settled
async function emit(event: string): Promise<void> {
  const listener = h.listeners.get(event);

  if (!listener) {
    throw new Error(`No listener for ${event}`);
  }

  void Promise.allSettled([listener()]);
  await flushPromises();
}

function rejectedInput(field: string): GraphQLFormattedError {
  return { message: "message", extensions: { code: "VALIDATION", field, errorCode: "InvalidCharacters" } };
}

// The GraphQL errors of one response, as the Apollo error link sends them, and the toast they show
function showToast(...errors: GraphQLFormattedError[]): INotification {
  h.listeners.get(graphqlErrorEvent)?.(errors);

  expect(h.notifyError).toHaveBeenCalledOnce();
  return h.notifyError.mock.calls[0][0] as INotification;
}

// The global toast for GraphQL errors no form shows: rejected input is for the user to correct, anything else is a
// problem the user can report
describe("graphqlErrorEvent", () => {
  beforeEach(() => {
    h.notifyError.mockReset();
    h.report.mockReset();
  });

  it("names the addresses and offers no report for rejected address input", () => {
    const notification = showToast(rejectedInput("addresses[0].firstName"));

    expect(notification.text).toBe("common.messages.invalid_addresses");
    expect(notification.button).toBeUndefined();
  });

  it("reports every error of the response when it also failed for another reason", () => {
    const errors = [rejectedInput("lastName"), { message: "boom" }];

    const notification = showToast(...errors);
    notification.button?.clickHandler?.("notification-1", new Event("click"));

    expect(notification.text).toBe("common.messages.invalid_data");
    expect(h.report).toHaveBeenCalledWith({ error: errors });
  });

  it("shows the generic text and a report button for an error that isn't rejected input", () => {
    const notification = showToast({ message: "boom" });

    expect(notification.text).toBe("common.messages.something_went_wrong");
    expect(notification.button).toBeDefined();
  });

  // An older backend sends VALIDATION without naming the field
  it("treats a VALIDATION error that names no field as a plain error", () => {
    const notification = showToast({ message: "Error trying to resolve field.", extensions: { code: "VALIDATION" } });

    expect(notification.text).toBe("common.messages.something_went_wrong");
    expect(notification.button).toBeDefined();
  });
});

// A session that is gone ends on Sign In, whichever of the two events comes first. A 403 with nothing to say a session
// was lost ends on NoAccess, for a signed-in user and for a guest alike.
describe("auth errors", () => {
  const PAGE_PATH = "/company/info?page=2";
  const PASSWORD_AND_LOCK_FLAGS = ["forcePasswordChange", "passwordExpired", "lockedState"];
  const SIGNED_IN_USER = { userName: "jane" };

  let router: Router;
  let pendingUserReloads: (() => void)[];
  let reloadedUser: Record<string, unknown>;

  // The `me` responses of every fetchUser call so far arrive
  async function reloadUser(): Promise<void> {
    pendingUserReloads.splice(0).forEach((resolve) => resolve());
    await flushPromises();
  }

  function pushedRouteNames(): unknown[] {
    return h.router.push.mock.calls.map(([to]) => (to as { name?: unknown }).name);
  }

  function signInWithDeadSession(): void {
    h.user.value = SIGNED_IN_USER;
    h.authHeaders.value = {};
  }

  async function run(steps: string[]): Promise<void> {
    const STEPS: Record<string, () => Promise<void>> = {
      unauthorized: () => emit(unauthorizedErrorEvent),
      forbidden: () => emit(forbiddenEvent),
      me: reloadUser,
    };

    for (const step of steps) {
      await STEPS[step]();
    }
  }

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/company/info", name: "CompanyInfo", component: {} },
        { path: ROUTES.SIGN_IN.PATH, name: ROUTES.SIGN_IN.NAME, component: {} },
        { path: "/403", name: "NoAccess", component: {}, meta: { public: true, redirectable: false } },
        { path: "/404", name: "NotFound", component: {}, meta: { public: true, redirectable: false } },
        { path: "/checkout/payment", name: "CheckoutPayment", component: {}, meta: { redirectable: false } },
      ],
    });
    router.afterEach(h.router.afterEach.mock.calls[0][0]);
    router.onError(h.router.onError.mock.calls[0][0]);
    await router.push(PAGE_PATH);

    h.router.currentRoute = router.currentRoute;
    h.router.push.mockReset().mockImplementation((to: RouteLocationRaw) => router.push(to));
    h.closeAllModals.mockReset();

    pendingUserReloads = [];
    reloadedUser = { userName: "Anonymous" };
    h.fetchUser.mockImplementation(
      () =>
        new Promise<void>((resolve) =>
          pendingUserReloads.push(() => {
            h.user.value = reloadedUser;
            resolve();
          }),
        ),
    );
  });

  // A session sent to Sign In stays lost until a navigation ends elsewhere, so the next test starts after one
  afterEach(async () => {
    await reloadUser();
    await router.push("/company/info");
  });

  it("sends a signed-in user to NoAccess without reloading the user", async () => {
    h.user.value = SIGNED_IN_USER;

    await emit(forbiddenEvent);

    expect(router.currentRoute.value.name).toBe("NoAccess");
    expect(h.fetchUser).not.toHaveBeenCalled();
  });

  it("sends a guest to NoAccess without reloading the user", async () => {
    h.authHeaders.value = {};

    await emit(forbiddenEvent);

    expect(router.currentRoute.value.name).toBe("NoAccess");
    expect(h.fetchUser).not.toHaveBeenCalled();
  });

  it("sends a guest whose request on Sign In is forbidden to NoAccess", async () => {
    await router.push(ROUTES.SIGN_IN.PATH);
    h.authHeaders.value = {};

    await emit(forbiddenEvent);

    expect(router.currentRoute.value.name).toBe("NoAccess");
  });

  it("sends a user whose access token is gone to Sign In with a return to the page, once the user is reloaded", async () => {
    signInWithDeadSession();

    await emit(forbiddenEvent);

    expect(h.fetchUser).toHaveBeenCalledOnce();
    expect(h.router.push).not.toHaveBeenCalled();

    await reloadUser();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(router.currentRoute.value.query).toEqual({ returnUrl: PAGE_PATH });
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  it("sends a user who is still signed in after the reload to NoAccess", async () => {
    signInWithDeadSession();
    reloadedUser = SIGNED_IN_USER;

    await emit(forbiddenEvent);
    await reloadUser();

    expect(router.currentRoute.value.name).toBe("NoAccess");
    expect(pushedRouteNames()).toEqual(["NoAccess"]);
  });

  it("sends a user to NoAccess when the reload fails", async () => {
    signInWithDeadSession();
    h.fetchUser.mockRejectedValue(new Error("me failed"));

    await emit(forbiddenEvent);

    expect(router.currentRoute.value.name).toBe("NoAccess");
  });

  it("stays on the page when the reload after a 401 fails, and reloads the user again on the next 401", async () => {
    signInWithDeadSession();
    h.fetchUser.mockRejectedValueOnce(new Error("me failed"));

    await emit(unauthorizedErrorEvent);

    expect(h.router.push).not.toHaveBeenCalled();

    await emit(unauthorizedErrorEvent);
    await reloadUser();

    expect(h.fetchUser).toHaveBeenCalledTimes(2);
    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
  });

  it.each([
    ["unauthorized", "me", "forbidden"],
    ["unauthorized", "forbidden", "me"],
    ["forbidden", "unauthorized", "me"],
    ["forbidden", "me", "unauthorized"],
  ])("ends on Sign In with one reload and one navigation when a refresh fails: %s, %s, %s", async (...steps) => {
    signInWithDeadSession();

    await run(steps);
    await reloadUser();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(router.currentRoute.value.query).toEqual({ returnUrl: PAGE_PATH });
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
    expect(h.fetchUser).toHaveBeenCalledOnce();
  });

  // Sign In is a lazy route: the 403 can arrive after `me` and before the page has opened
  it("keeps a 403 that arrives while Sign In is opening from ending on NoAccess", async () => {
    let openSignIn = (): void => {};
    h.router.push.mockImplementation(
      (to: RouteLocationRaw) => new Promise((resolve) => (openSignIn = () => resolve(router.push(to)))),
    );
    signInWithDeadSession();

    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await emit(forbiddenEvent);
    openSignIn();
    await flushPromises();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  it("keeps a 403 that arrives once Sign In is open there", async () => {
    signInWithDeadSession();

    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await emit(forbiddenEvent);

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  // Only a failed refresh removes the token: one the server stopped accepting is still sent
  it("keeps a 403 off NoAccess when the token of the lost session is still stored", async () => {
    h.user.value = SIGNED_IN_USER;

    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await emit(forbiddenEvent);

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  // The cancelled navigation reports its failure while Sign In is still opening
  it("keeps a late 403 off NoAccess when the push to Sign In cancels a navigation in flight", async () => {
    const open: Record<string, () => void> = {};
    router.addRoute({ path: "/slow", name: "Slow", component: {} });
    router.beforeEach((to) =>
      to.name === "CompanyInfo" ? true : new Promise<void>((resolve) => (open[String(to.name)] = resolve)),
    );
    signInWithDeadSession();

    void router.push("/slow");
    await flushPromises();
    await emit(unauthorizedErrorEvent);
    await reloadUser();
    open.Slow();
    await flushPromises();
    await emit(forbiddenEvent);
    open[ROUTES.SIGN_IN.NAME]();
    await flushPromises();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  it("keeps a late 403 off NoAccess when the navigation that the push to Sign In cancels fails to load", async () => {
    let failToLoad = (): void => {};
    let openSignIn = (): void => {};
    router.addRoute({
      path: "/broken",
      name: "Broken",
      component: () => new Promise<never>((_resolve, reject) => (failToLoad = () => reject(new Error("chunk")))),
    });
    router.beforeEach((to) =>
      to.name === ROUTES.SIGN_IN.NAME ? new Promise<void>((resolve) => (openSignIn = resolve)) : true,
    );
    signInWithDeadSession();

    void router.push("/broken").catch(() => undefined);
    await flushPromises();
    await emit(unauthorizedErrorEvent);
    await reloadUser();
    failToLoad();
    await flushPromises();
    await emit(forbiddenEvent);
    openSignIn();
    await flushPromises();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  // The user is a guest on the page from then on
  it("handles the next errors as usual after a leave guard refuses the push to Sign In", async () => {
    router.beforeEach((to) => to.name !== ROUTES.SIGN_IN.NAME);
    signInWithDeadSession();

    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await emit(forbiddenEvent);

    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME, "NoAccess"]);
    expect(router.currentRoute.value.name).toBe("NoAccess");
  });

  it("handles the next errors as usual after Sign In fails to load", async () => {
    router.removeRoute(ROUTES.SIGN_IN.NAME);
    router.addRoute({
      path: ROUTES.SIGN_IN.PATH,
      name: ROUTES.SIGN_IN.NAME,
      component: () => Promise.reject(new Error("chunk failed to load")),
    });
    h.router.push.mockImplementation((to: RouteLocationRaw) => router.push(to).catch(() => undefined));
    signInWithDeadSession();

    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await emit(forbiddenEvent);

    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME, "NoAccess"]);
    expect(router.currentRoute.value.name).toBe("NoAccess");
  });

  // A leave guard that never resolves holds the push to Sign In forever
  it("handles the next errors as usual once the user has moved on from a push to Sign In that never ended", async () => {
    router.beforeEach((to) => (to.name === ROUTES.SIGN_IN.NAME ? new Promise<never>(() => {}) : true));
    signInWithDeadSession();

    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await router.push("/company/info");
    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await emit(forbiddenEvent);

    expect(h.fetchUser).toHaveBeenCalledTimes(2);
    expect(router.currentRoute.value.name).toBe("NoAccess");
  });

  // A store open to anonymous users lets a guest check out: the guest's 401 leaves them there, the 403 does not
  it("sends a guest to NoAccess when a 403 arrives while a 401 is reloading the user", async () => {
    await router.push("/checkout/payment");
    h.authHeaders.value = {};

    await emit(unauthorizedErrorEvent);
    await emit(forbiddenEvent);
    await reloadUser();

    expect(router.currentRoute.value.name).toBe("NoAccess");
  });

  // As on dev: nothing tells a guest's 403 from a missing permission
  it("sends a guest to NoAccess when a 403 follows the 401 that sent them to Sign In", async () => {
    h.authHeaders.value = {};

    await emit(unauthorizedErrorEvent);
    await reloadUser();
    await emit(forbiddenEvent);

    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME, "NoAccess"]);
  });

  // `setUser` emits the event that takes such a user to Change Password or to the blocked page
  it.each(PASSWORD_AND_LOCK_FLAGS)("does not send a user reloaded with %s to Sign In after a 401", async (flag) => {
    h.user.value = SIGNED_IN_USER;
    reloadedUser = { ...SIGNED_IN_USER, [flag]: true };

    await emit(unauthorizedErrorEvent);
    await reloadUser();

    expect(h.fetchUser).toHaveBeenCalledOnce();
    expect(router.currentRoute.value.fullPath).toBe(PAGE_PATH);
    expect(h.router.push).not.toHaveBeenCalled();
  });

  // Checkout can't be a returnUrl, so there is no way back to offer
  it("sends a session that died on a page with no way back to Sign In without a return", async () => {
    await router.push("/checkout/payment");
    signInWithDeadSession();

    await emit(unauthorizedErrorEvent);
    await reloadUser();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(router.currentRoute.value.query).toEqual({});
    expect(h.closeAllModals).toHaveBeenCalledOnce();
  });

  it("sends a session that several 403s found dead on a page with no way back to Sign In once", async () => {
    await router.push("/checkout/payment");
    signInWithDeadSession();

    await run(["forbidden", "forbidden", "me", "forbidden"]);

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(router.currentRoute.value.query).toEqual({});
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
    expect(h.fetchUser).toHaveBeenCalledOnce();
  });

  it("sends a session that died on a page already carrying a return to Sign In without another", async () => {
    await router.push("/company/info?returnUrl=%2Fcart");
    signInWithDeadSession();

    await emit(unauthorizedErrorEvent);
    await reloadUser();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(router.currentRoute.value.query).toEqual({});
  });

  it("stays on a page with no way back when the reloaded user is still signed in", async () => {
    await router.push("/checkout/payment");
    h.user.value = SIGNED_IN_USER;
    reloadedUser = SIGNED_IN_USER;

    await emit(unauthorizedErrorEvent);
    await reloadUser();

    expect(h.fetchUser).toHaveBeenCalledOnce();
    expect(router.currentRoute.value.fullPath).toBe("/checkout/payment");
    expect(h.router.push).not.toHaveBeenCalled();
    expect(h.closeAllModals).not.toHaveBeenCalled();
  });

  it("leaves a guest on a page with no way back", async () => {
    await router.push("/checkout/payment");
    h.authHeaders.value = {};

    await emit(unauthorizedErrorEvent);
    await reloadUser();

    expect(h.fetchUser).toHaveBeenCalledOnce();
    expect(router.currentRoute.value.fullPath).toBe("/checkout/payment");
    expect(h.router.push).not.toHaveBeenCalled();
  });

  // Nowhere to send the user from a public page with no way back, or from Sign In, where a signed-in user confirms
  // who they are
  it.each([
    ["/404", "unauthorized", "me", "forbidden"],
    ["/404", "forbidden", "me", "unauthorized"],
    [`${ROUTES.SIGN_IN.PATH}?reauthenticate=1`, "unauthorized", "me", "forbidden"],
    [`${ROUTES.SIGN_IN.PATH}?reauthenticate=1`, "forbidden", "me", "unauthorized"],
  ])("leaves a session that died on %s there: %s, %s, %s", async (path, ...steps) => {
    await router.push(path);
    signInWithDeadSession();

    await run(steps);
    await reloadUser();

    expect(router.currentRoute.value.fullPath).toBe(path);
    expect(h.router.push).not.toHaveBeenCalled();
    expect(h.fetchUser).toHaveBeenCalledOnce();
  });
});

// A forced redirect leaves no modal of the page being left on top of the page it opens
describe("forced redirects", () => {
  const PAGE = { name: "Orders", fullPath: "/account/orders", query: {}, matched: [], meta: {} };

  beforeEach(() => {
    h.router.currentRoute = { value: PAGE };
    // A navigation that never settles: the modals must close without waiting for it
    const navigation = new Promise<void>(() => {});
    h.router.push.mockReset().mockReturnValue(navigation);
    h.router.replace.mockReset().mockReturnValue(navigation);
    h.client.refetchQueries.mockReset();
    h.user.value = {};
    h.closeAllModals.mockReset();
  });

  it("closes the modals when an unauthorized error sends the user to Sign In", async () => {
    await emit(unauthorizedErrorEvent);

    expect(h.router.push).toHaveBeenCalledWith(expect.objectContaining({ name: ROUTES.SIGN_IN.NAME }));
    expect(h.closeAllModals).toHaveBeenCalledOnce();
  });

  it.each(["forcePasswordChange", "passwordExpired", "lockedState"])(
    "keeps the modals on an unauthorized error when the user has %s",
    async (flag) => {
      h.user.value = { [flag]: true };

      await emit(unauthorizedErrorEvent);

      expect(h.fetchUser).toHaveBeenCalledOnce();
      expect(h.router.push).not.toHaveBeenCalled();
      expect(h.closeAllModals).not.toHaveBeenCalled();
    },
  );

  it("keeps the modals on an unauthorized error when Sign In is already open", async () => {
    h.router.currentRoute.value = { ...PAGE, name: ROUTES.SIGN_IN.NAME, fullPath: ROUTES.SIGN_IN.PATH };

    await emit(unauthorizedErrorEvent);

    expect(h.fetchUser).toHaveBeenCalledOnce();
    expect(h.router.push).not.toHaveBeenCalled();
    expect(h.closeAllModals).not.toHaveBeenCalled();
  });

  it("closes the modals when access is forbidden", async () => {
    await emit(forbiddenEvent);

    expect(h.router.push).toHaveBeenCalledWith({ name: "NoAccess" });
    expect(h.closeAllModals).toHaveBeenCalledOnce();
  });

  it("keeps the modals when access is forbidden and NoAccess is already open", async () => {
    h.router.currentRoute.value = { ...PAGE, name: "NoAccess", fullPath: "/403" };

    await emit(forbiddenEvent);

    expect(h.router.push).not.toHaveBeenCalled();
    expect(h.closeAllModals).not.toHaveBeenCalled();
  });

  it("closes the modals when a cart change sends the user from Checkout to Cart", async () => {
    h.router.currentRoute.value = { ...PAGE, name: "Shipping", params: {}, matched: [{ name: "Checkout" }] };

    await emit(cartReloadEvent);

    expect(h.router.replace).toHaveBeenCalledWith(expect.objectContaining({ name: "Cart" }));
    expect(h.closeAllModals).toHaveBeenCalledOnce();
  });

  it("keeps the modals when the cart changes outside Checkout", async () => {
    await emit(cartReloadEvent);

    expect(h.client.refetchQueries).toHaveBeenCalled();
    expect(h.closeAllModals).not.toHaveBeenCalled();
  });

  it("closes the modals when an expired password sends the user to Change Password", async () => {
    await emit(passwordExpiredEvent);

    expect(h.router.push).toHaveBeenCalledWith(expect.objectContaining({ name: ROUTES.CHANGE_PASSWORD.NAME }));
    expect(h.closeAllModals).toHaveBeenCalledOnce();
  });

  it("keeps the modals on an expired password when Change Password is already open", async () => {
    h.router.currentRoute.value = { ...PAGE, name: ROUTES.CHANGE_PASSWORD.NAME, fullPath: ROUTES.CHANGE_PASSWORD.PATH };

    await emit(passwordExpiredEvent);

    expect(h.router.push).not.toHaveBeenCalled();
    expect(h.closeAllModals).not.toHaveBeenCalled();
  });
});
