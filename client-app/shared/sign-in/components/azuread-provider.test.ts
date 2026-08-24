import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import AzureAdProvider from "./azuread-provider.vue";

const themeContext = ref({ settings: { default_return_url: "/default-page" } });

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ themeContext }),
}));

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-id" },
}));

describe("azuread-provider", () => {
  const originalLocation = window.location;
  const assign = vi.fn<(url: string | URL) => void>();

  const mountOptions = {
    global: {
      mocks: { $t: (key: string) => key },
      stubs: {
        IdentityProvider: { template: `<button type="button" @click="$emit('signIn')" />` },
      },
    },
  };

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

  it("returns to the given url after the external sign in", async () => {
    const wrapper = mount(AzureAdProvider, {
      ...mountOptions,
      props: { returnUrl: "/account/impersonate/user-id" },
    });

    await wrapper.find("button").trigger("click");

    const url = new URL(String(assign.mock.calls[0][0]));

    expect(url.searchParams.get("authenticationType")).toBe("AzureAD");
    expect(url.searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
    );
  });

  it("falls back to the default return url", async () => {
    const wrapper = mount(AzureAdProvider, mountOptions);

    await wrapper.find("button").trigger("click");

    expect(new URL(String(assign.mock.calls[0][0])).searchParams.get("callbackUrl")).toBe(
      "http://localhost:3000/auth/callback?returnUrl=%2Fdefault-page",
    );
  });
});
