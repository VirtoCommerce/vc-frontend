import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import AzureAdProvider from "./azuread-provider.vue";

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-id" },
}));

describe("azuread-provider", () => {
  const originalLocation = window.location;
  const assign = vi.fn<(url: string | URL) => void>();

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

  it("comes back to the page it was signed in from", async () => {
    const wrapper = mount(AzureAdProvider, {
      props: { returnUrl: "/account/impersonate/user-id" },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          IdentityProvider: { template: `<button type="button" @click="$emit('signIn')" />` },
        },
      },
    });

    await wrapper.find("button").trigger("click");

    const url = new URL(String(assign.mock.calls[0][0]));

    expect(url.searchParams.get("authenticationType")).toBe("AzureAD");
    expect(url.searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
    );
  });
});
