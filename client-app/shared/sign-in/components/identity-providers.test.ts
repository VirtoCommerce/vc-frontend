import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import IdentityProviders from "./identity-providers.vue";

vi.mock("@/core/globals", () => ({
  globals: { storeId: "store-id" },
}));

describe("identity-providers", () => {
  const originalLocation = window.location;
  const assign = vi.fn<(url: string | URL) => void>();

  async function mountProviders(providers: string[]) {
    const wrapper = mount(IdentityProviders, {
      props: { providers, returnUrl: "/account/impersonate/user-id" },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          IdentityProvider: { template: `<button type="button" @click="$emit('signIn')" />` },
        },
      },
    });

    await vi.dynamicImportSettled();
    await flushPromises();

    return wrapper;
  }

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

  it("hands the page to come back to over to every provider", async () => {
    const wrapper = await mountProviders(["AzureAD", "GoogleSSO"]);

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(2);

    for (const [index, button] of buttons.entries()) {
      await button.trigger("click");

      const url = new URL(String(assign.mock.calls[index][0]));

      expect(url.searchParams.get("callbackUrl")).toBe(
        "http://localhost:3000/auth/callback?returnUrl=%2Faccount%2Fimpersonate%2Fuser-id",
      );
    }

    expect(assign).toHaveBeenCalledTimes(2);
  });

  it("renders the providers of the store in order", async () => {
    const wrapper = await mountProviders(["GoogleSSO", "AzureAD"]);

    await wrapper.findAll("button")[0].trigger("click");

    expect(new URL(String(assign.mock.calls[0][0])).searchParams.get("authenticationType")).toBe("GoogleSSO");
  });

  it("skips a provider this theme does not ship, keeping the others", async () => {
    const wrapper = await mountProviders(["Okta", "AzureAD"]);

    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(1);

    await buttons[0].trigger("click");

    expect(new URL(String(assign.mock.calls[0][0])).searchParams.get("authenticationType")).toBe("AzureAD");
  });
});
