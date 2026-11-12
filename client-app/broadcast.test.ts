import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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

const h = vi.hoisted(() => ({
  listeners: new Map<string, (data?: unknown) => unknown>(),
  notifyError: vi.fn(),
  report: vi.fn(),
  router: { currentRoute: { value: {} }, push: vi.fn(), replace: vi.fn() },
  client: { refetchQueries: vi.fn(), cache: { gc: vi.fn() } },
  user: { value: {} },
  closeAllModals: vi.fn(),
}));

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
  useReturnUrl: () => ({ getReturnUrl: vi.fn() }),
  useSupportReports: () => ({ report: h.report }),
}));
vi.mock("@/core/api/graphql", async () => ({
  filterActiveQueryNames: vi.fn(),
  getFieldValidationErrors: (await import("@/core/api/graphql/utils")).getFieldValidationErrors,
}));
vi.mock("@/shared/account", () => ({
  useUser: () => ({ fetchUser: vi.fn(), user: h.user }),
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

// A forced redirect leaves no modal of the page being left on top of the page it opens
describe("forced redirects", () => {
  const PAGE = { name: "Orders", fullPath: "/account/orders", query: {}, matched: [] };

  async function emit(event: string) {
    await h.listeners.get(event)?.();
  }

  beforeEach(() => {
    h.router.currentRoute.value = PAGE;
    // The navigation never settles, so the modals must close without waiting for it
    h.router.push.mockReset().mockReturnValue(new Promise(() => {}));
    h.router.replace.mockReset().mockReturnValue(new Promise(() => {}));
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

      expect(h.router.push).not.toHaveBeenCalled();
      expect(h.closeAllModals).not.toHaveBeenCalled();
    },
  );

  it("keeps the modals on an unauthorized error when Sign In is already open", async () => {
    h.router.currentRoute.value = { ...PAGE, name: ROUTES.SIGN_IN.NAME, fullPath: ROUTES.SIGN_IN.PATH };

    await emit(unauthorizedErrorEvent);

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

    // Not awaited: the handler awaits the navigation, which never settles here
    void emit(cartReloadEvent);

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
