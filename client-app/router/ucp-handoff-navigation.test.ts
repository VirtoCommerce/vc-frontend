import { beforeEach, expect, test, vi } from "vitest";
import { createRouter } from "./index";

const state = vi.hoisted(() => ({
  authenticated: { value: false },
  theme: { value: { storeSettings: { anonymousUsersAllowed: false } } },
}));

vi.mock("@/core/composables", () => ({ useThemeContext: () => ({ themeContext: state.theme }) }));
vi.mock("@/shared/account", () => ({
  useUser: () => ({ isAuthenticated: state.authenticated, organization: { value: undefined } }),
}));
vi.mock("@/core/utilities", async () => {
  const { buildRedirectUrl } = await import("@/core/utilities/common");
  return { buildRedirectUrl, getReturnUrlValue: () => undefined };
});
vi.mock("./routes", () => ({
  mainRoutes: [
    { path: "/", name: "Home", component: {} },
    { path: "/sign-in", name: "SignIn", component: {}, meta: { public: true } },
    { path: "/catalog", name: "Catalog", component: {} },
    { path: "/checkout/:cartId?", name: "Checkout", component: {}, meta: { redirectable: false } },
  ],
}));

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  window.history.replaceState({}, "", "/");
  state.authenticated.value = false;
});

test("preserves an authenticated handoff before the closed-store guard redirects to login", async () => {
  const router = createRouter({ base: "/" });
  await router.push("/checkout?ucp_session=opaque-session");
  expect(router.currentRoute.value.name).toBe("SignIn");
  expect(router.currentRoute.value.query.returnUrl).toBe("/checkout?ucp_session=opaque-session");
});

test("keeps the existing non-redirectable behavior for ordinary checkout", async () => {
  const router = createRouter({ base: "/" });
  await router.push("/checkout");
  expect(router.currentRoute.value.name).toBe("SignIn");
  expect(router.currentRoute.value.query.returnUrl).toBeUndefined();
});
