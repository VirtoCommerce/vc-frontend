import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AzureAdProvider from "./azuread-provider.vue";
import GoogleSsoProvider from "./googlesso-provider.vue";
import type { Component } from "vue";

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-id" },
}));

const assign = vi.fn<(url: string | URL) => void>();

const mountOptions = {
  global: {
    mocks: { $t: (key: string) => key },
    stubs: {
      IdentityProvider: { template: `<button type="button" @click="$emit('signIn')" />` },
    },
  },
};

function getSignInUrl(): URL {
  expect(assign).toHaveBeenCalledOnce();
  return new URL(String(assign.mock.calls[0][0]));
}

describe.each([
  ["azuread", AzureAdProvider, "AzureAD", "http://localhost:3000/signin-oidc"],
  ["googlesso", GoogleSsoProvider, "GoogleSSO", "http://localhost:3000/signin-google"],
])("%s-provider", (_name, provider, authenticationType, oidcUrl) => {
  const originalLocation = window.location;

  beforeEach(() => {
    assign.mockClear();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost:3000/account/impersonate/user-id", origin: "http://localhost:3000", assign },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("signs in through its own provider", async () => {
    const wrapper = mount(provider as Component, { ...mountOptions, props: { returnUrl: "/" } });

    await wrapper.find("button").trigger("click");

    const url = getSignInUrl();

    expect(url.searchParams.get("authenticationType")).toBe(authenticationType);
    expect(url.searchParams.get("oidcUrl")).toBe(oidcUrl);
  });

  it("comes back to the page it was signed in from", async () => {
    const wrapper = mount(provider as Component, {
      ...mountOptions,
      props: { returnUrl: "/account/impersonate/user-id" },
    });

    await wrapper.find("button").trigger("click");

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
    );
  });

  it("reads the page to come back to when the sign in starts, not when it is rendered", async () => {
    const wrapper = mount(provider as Component, { ...mountOptions, props: { returnUrl: "/account/orders" } });

    await wrapper.setProps({ returnUrl: "/account/impersonate/user-id" });
    await wrapper.find("button").trigger("click");

    expect(getSignInUrl().searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
    );
  });
});
