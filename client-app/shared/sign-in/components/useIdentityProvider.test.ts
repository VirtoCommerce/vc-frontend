import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useIdentityProvider } from "./useIdentityProvider";

const themeContext = ref({ settings: { default_return_url: "/default-page" } });

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ themeContext }),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-id" },
}));

describe("useIdentityProvider", () => {
  const originalLocation = window.location;
  const assign = vi.fn<(url: string | URL) => void>();

  function mockLocation(href: string): void {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href, origin: new URL(href).origin, assign },
    });
  }

  function getSignInUrl(): URL {
    expect(assign).toHaveBeenCalledOnce();
    return new URL(String(assign.mock.calls[0][0]));
  }

  beforeEach(() => {
    assign.mockClear();
    mockLocation("http://localhost:3000/sign-in");
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("passes the authentication type, the oidc url and the store id", () => {
    useIdentityProvider("AzureAD", "/signin-oidc").signIn();

    const url = getSignInUrl();

    expect(url.pathname).toBe("/externalsignin");
    expect(url.searchParams.get("authenticationType")).toBe("AzureAD");
    expect(url.searchParams.get("oidcUrl")).toBe("http://localhost:3000/signin-oidc");
    expect(url.searchParams.get("storeId")).toBe("store-id");
  });

  it("returns to the default return url when nothing else is provided", () => {
    useIdentityProvider("AzureAD", "/signin-oidc").signIn();

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Fdefault-page",
    );
  });

  it("returns to the return url of the current location", () => {
    mockLocation("http://localhost:3000/sign-in?returnUrl=/account/orders");

    useIdentityProvider("AzureAD", "/signin-oidc").signIn();

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Forders",
    );
  });

  it("prefers the provided return url over the one from the current location", () => {
    mockLocation("http://localhost:3000/account/impersonate/user-id?returnUrl=/account/orders");

    useIdentityProvider("AzureAD", "/signin-oidc", "/account/impersonate/user-id").signIn();

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
    );
  });

  it("accepts the return url as a getter", () => {
    const returnUrl = ref<string | undefined>(undefined);

    const { signIn } = useIdentityProvider("GoogleSSO", "/signin-google", () => returnUrl.value);

    returnUrl.value = "/account/impersonate/user-id";
    signIn();

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
    );
  });
});
