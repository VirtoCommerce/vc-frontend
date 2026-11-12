import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { ROUTES } from "@/router/routes/constants";
import { forbiddenEvent, graphqlErrorEvent, unauthorizedErrorEvent } from "@/shared/broadcast";
import { setupBroadcastGlobalListeners } from "./broadcast";
import type { INotification } from "@/shared/notification";
import type { GraphQLFormattedError } from "graphql";
import type { RouteLocationRaw, Router } from "vue-router";

const h = vi.hoisted(() => ({
  listeners: new Map<string, (data?: unknown) => unknown>(),
  notifyError: vi.fn(),
  report: vi.fn(),
  router: { currentRoute: { value: {} }, push: vi.fn() },
  authHeaders: { value: {} },
  fetchUser: vi.fn(),
  user: { value: {} },
}));

vi.mock("@vue/apollo-composable", () => ({ useApolloClient: () => ({ client: {} }) }));
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
  useUser: () => ({ fetchUser: h.fetchUser, user: h.user }),
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
vi.mock("@/shared/notification", () => ({ useNotifications: () => ({ error: h.notifyError, update: vi.fn() }) }));

beforeAll(() => {
  setupBroadcastGlobalListeners();
});

beforeEach(() => {
  h.authHeaders.value = { Authorization: "Bearer token" };
  h.fetchUser.mockReset();
  h.user.value = {};
});

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

// A session that is gone ends on Sign In, whichever of the two events comes first; NoAccess is for a signed-in user
describe("auth errors", () => {
  const PAGE_PATH = "/company/info?page=2";
  const PASSWORD_AND_LOCK_FLAGS = ["forcePasswordChange", "passwordExpired", "lockedState"];

  let router: Router;
  let pendingUserReloads: (() => void)[];
  let reloadedUser: Record<string, unknown>;

  // Emitters don't wait for the listener, so the next step runs while it may still be waiting for `me`
  async function emit(event: string): Promise<void> {
    void h.listeners.get(event)?.();
    await flushPromises();
  }

  // The `me` responses of every fetchUser call so far arrive
  async function reloadUser(): Promise<void> {
    pendingUserReloads.splice(0).forEach((resolve) => resolve());
    await flushPromises();
  }

  function pushedRouteNames(): unknown[] {
    return h.router.push.mock.calls.map(([to]) => (to as { name?: unknown }).name);
  }

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/company/info", name: "CompanyInfo", component: {} },
        { path: ROUTES.SIGN_IN.PATH, name: ROUTES.SIGN_IN.NAME, component: {} },
        { path: "/403", name: "NoAccess", component: {}, meta: { redirectable: false } },
      ],
    });
    await router.push(PAGE_PATH);

    h.router.currentRoute = router.currentRoute;
    h.router.push.mockReset().mockImplementation((to: RouteLocationRaw) => router.push(to));

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

  // A redirect still waiting for `me` would be shared with the next test
  afterEach(reloadUser);

  it("sends a signed-in user to NoAccess without reloading the user", async () => {
    await emit(forbiddenEvent);

    expect(router.currentRoute.value.name).toBe("NoAccess");
    expect(h.fetchUser).not.toHaveBeenCalled();
  });

  it("sends a client without an access token to Sign In with a return to the page, once the user is reloaded", async () => {
    h.authHeaders.value = {};

    await emit(forbiddenEvent);

    expect(h.fetchUser).toHaveBeenCalledOnce();
    expect(h.router.push).not.toHaveBeenCalled();

    await reloadUser();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(router.currentRoute.value.query).toEqual({ returnUrl: PAGE_PATH });
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  it.each([
    ["unauthorized", "me", "forbidden"],
    ["unauthorized", "forbidden", "me"],
    ["forbidden", "unauthorized", "me"],
    ["forbidden", "me", "unauthorized"],
  ])("ends on Sign In with one navigation when a refresh fails: %s, %s, %s", async (...steps) => {
    const STEPS: Record<string, () => Promise<void>> = {
      unauthorized: () => emit(unauthorizedErrorEvent),
      forbidden: () => emit(forbiddenEvent),
      me: reloadUser,
    };
    h.authHeaders.value = {};

    for (const step of steps) {
      await STEPS[step]();
    }
    await reloadUser();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
    expect(router.currentRoute.value.query).toEqual({ returnUrl: PAGE_PATH });
    expect(pushedRouteNames()).toEqual([ROUTES.SIGN_IN.NAME]);
  });

  it("shares one user reload between the two events", async () => {
    h.authHeaders.value = {};

    await emit(unauthorizedErrorEvent);
    await emit(forbiddenEvent);
    await reloadUser();

    expect(h.fetchUser).toHaveBeenCalledOnce();
  });

  it.each(
    [unauthorizedErrorEvent, forbiddenEvent].flatMap((event) => PASSWORD_AND_LOCK_FLAGS.map((flag) => [event, flag])),
  )("stays on the page after %s when the reloaded user has %s", async (event, flag) => {
    h.authHeaders.value = {};
    reloadedUser = { [flag]: true };

    await emit(event);
    await reloadUser();

    expect(router.currentRoute.value.fullPath).toBe(PAGE_PATH);
    expect(h.router.push).not.toHaveBeenCalled();
  });

  it("stays on Sign In when a request made there is forbidden", async () => {
    await router.push(ROUTES.SIGN_IN.PATH);
    h.authHeaders.value = {};

    await emit(forbiddenEvent);
    await reloadUser();

    expect(router.currentRoute.value.fullPath).toBe(ROUTES.SIGN_IN.PATH);
    expect(h.router.push).not.toHaveBeenCalled();
  });
});
