import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useIdentityProvider } from "./useIdentityProvider";

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-id" },
}));

describe("useIdentityProvider", () => {
  const originalLocation = window.location;
  const assign = vi.fn<(url: string | URL) => void>();

  function getSignInUrl(): URL {
    expect(assign).toHaveBeenCalledOnce();
    return new URL(String(assign.mock.calls[0][0]));
  }

  beforeEach(() => {
    assign.mockClear();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost:3000/sign-in", origin: "http://localhost:3000", assign },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("passes the authentication type, the oidc url and the store id", () => {
    useIdentityProvider("AzureAD", "/signin-oidc", "/").signIn();

    const url = getSignInUrl();

    expect(url.pathname).toBe("/externalsignin");
    expect(url.searchParams.get("authenticationType")).toBe("AzureAD");
    expect(url.searchParams.get("oidcUrl")).toBe("http://localhost:3000/signin-oidc");
    expect(url.searchParams.get("storeId")).toBe("store-id");
  });

  it("comes back to the given page after the external sign in", () => {
    useIdentityProvider("AzureAD", "/signin-oidc", "/account/impersonate/user-id").signIn();

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
    );
  });

  it("reads the page to come back to when the sign in starts", () => {
    const returnUrl = ref("/");

    const { signIn } = useIdentityProvider("GoogleSSO", "/signin-google", returnUrl);

    returnUrl.value = "/account/orders";
    signIn();

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Forders",
    );
  });
});
