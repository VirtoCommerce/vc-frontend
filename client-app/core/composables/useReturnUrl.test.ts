import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useReturnUrl } from "./useReturnUrl";

const themeContext = ref<{ settings: { default_return_url?: string } }>({ settings: {} });

vi.mock("./useThemeContext", () => ({
  useThemeContext: () => ({ themeContext }),
}));

describe("useReturnUrl", () => {
  const originalLocation = window.location;

  function mockLocation(href: string): void {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href, origin: new URL(href).origin },
    });
  }

  beforeEach(() => {
    themeContext.value = { settings: { default_return_url: "/default-page" } };
    mockLocation("http://localhost:3000/sign-in");
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("returns the requested page", () => {
    mockLocation("http://localhost:3000/sign-in?returnUrl=/account/orders");

    expect(useReturnUrl().getReturnUrl()).toBe("/account/orders");
  });

  it("returns the store default when no page is requested", () => {
    expect(useReturnUrl().getReturnUrl()).toBe("/default-page");
  });

  it("returns the home page when the store has no default", () => {
    themeContext.value = { settings: {} };

    expect(useReturnUrl().getReturnUrl()).toBe("/");
  });

  it("ignores a requested page from another host", () => {
    mockLocation("http://localhost:3000/sign-in?returnUrl=http://example.com/phishing");

    expect(useReturnUrl().getReturnUrl()).toBe("/default-page");
  });

  it("reads the location on every call", () => {
    const { getReturnUrl } = useReturnUrl();

    expect(getReturnUrl()).toBe("/default-page");

    mockLocation("http://localhost:3000/sign-in?returnUrl=/account/orders");

    expect(getReturnUrl()).toBe("/account/orders");
  });
});
