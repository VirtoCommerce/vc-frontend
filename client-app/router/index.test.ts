import { describe, expect, test, vi, beforeEach } from "vitest";
import { createRouter } from "@/router";
import { ROUTES } from "@/router/routes/constants";

const state = vi.hoisted(() => ({
  isAuthenticated: false,
  isAwaitingApproval: false,
  anonymousUsersAllowed: true,
}));

vi.mock("@/shared/account", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/account")>()),
  useUser: () => ({
    isAuthenticated: { value: state.isAuthenticated },
    isAwaitingApproval: { value: state.isAwaitingApproval },
    organization: { value: null },
  }),
}));

vi.mock("@/core/composables", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/core/composables")>()),
  useThemeContext: () => ({
    themeContext: {
      value: { storeSettings: { anonymousUsersAllowed: state.anonymousUsersAllowed } },
    },
  }),
}));

describe("router guard — /change-password requires auth (VCST-5438)", () => {
  beforeEach(() => {
    state.isAuthenticated = false;
    state.isAwaitingApproval = false;
    state.anonymousUsersAllowed = true;
    window.history.replaceState({}, "", "/");
  });

  // Repro: after logout on /change-password (anonymousUsersAllowed store) the anonymous
  // user must NOT be left on the account-only form — the guard has to redirect to sign-in,
  // exactly as it does for every other authenticated page.
  test("redirects an anonymous user away from /change-password to sign-in", async () => {
    state.isAuthenticated = false;
    state.anonymousUsersAllowed = true;

    const router = createRouter({ base: "/" });
    await router.push("/change-password?returnUrl=/account/dashboard");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe(ROUTES.SIGN_IN.NAME);
  });

  // Guard: the fix must not break the legitimate flow — an authenticated user
  // (incl. the forced expired-password redirect) can still open the form.
  test("still allows an authenticated user to open /change-password", async () => {
    state.isAuthenticated = true;

    const router = createRouter({ base: "/" });
    await router.push("/change-password");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe(ROUTES.CHANGE_PASSWORD.NAME);
  });
});

describe("router guard — customers awaiting approval", () => {
  beforeEach(() => {
    state.isAuthenticated = true;
    state.isAwaitingApproval = true;
    state.anonymousUsersAllowed = false;
    window.history.replaceState({}, "", "/");
  });

  test("sends a signed-in customer who is not approved from the catalog to the waiting page", async () => {
    const router = createRouter({ base: "/" });
    await router.push("/catalog");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe(ROUTES.AWAITING_APPROVAL.NAME);
  });

  // The password-expiry modal sends the customer to the form; sending them back would loop.
  test("lets a customer awaiting approval change their password", async () => {
    const router = createRouter({ base: "/" });
    await router.push("/change-password");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe(ROUTES.CHANGE_PASSWORD.NAME);
  });

  test("leaves public pages alone while awaiting approval", async () => {
    const router = createRouter({ base: "/" });
    await router.push("/404");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe("NotFound");
  });

  test("sends an approved customer away from the waiting page to the catalog", async () => {
    state.isAwaitingApproval = false;

    const router = createRouter({ base: "/" });
    await router.push("/awaiting-approval");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe(ROUTES.CATALOG.NAME);
  });

  test("lets an approved customer open the catalog", async () => {
    state.isAwaitingApproval = false;

    const router = createRouter({ base: "/" });
    await router.push("/catalog");
    await router.isReady();

    expect(router.currentRoute.value.name).toBe(ROUTES.CATALOG.NAME);
  });
});
