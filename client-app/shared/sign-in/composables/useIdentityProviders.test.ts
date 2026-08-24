import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useIdentityProviders } from "./useIdentityProviders";

const themeContext = ref<{ storeSettings: { authenticationTypes?: string[] } }>({
  storeSettings: { authenticationTypes: [] },
});

vi.mock("@/core/composables", () => ({
  useThemeContext: () => ({ themeContext }),
}));

function setAuthenticationTypes(authenticationTypes?: string[]): void {
  themeContext.value = { storeSettings: { authenticationTypes } };
}

describe("useIdentityProviders", () => {
  beforeEach(() => {
    setAuthenticationTypes([]);
  });

  it("falls back to password authentication when the store has no authentication types", () => {
    setAuthenticationTypes();

    const { identityProviders, hasIdentityProviders, hasPasswordAuthentication, hasOnlyIdentityProviders } =
      useIdentityProviders();

    expect(identityProviders.value).toEqual([]);
    expect(hasIdentityProviders.value).toBe(false);
    expect(hasPasswordAuthentication.value).toBe(true);
    expect(hasOnlyIdentityProviders.value).toBe(false);
  });

  it("excludes the password type from the identity providers", () => {
    setAuthenticationTypes(["Password", "AzureAD", "GoogleSSO"]);

    const { identityProviders, hasIdentityProviders, hasPasswordAuthentication, hasOnlyIdentityProviders } =
      useIdentityProviders();

    expect(identityProviders.value).toEqual(["AzureAD", "GoogleSSO"]);
    expect(hasIdentityProviders.value).toBe(true);
    expect(hasPasswordAuthentication.value).toBe(true);
    expect(hasOnlyIdentityProviders.value).toBe(false);
  });

  it("detects a store without password authentication", () => {
    setAuthenticationTypes(["AzureAD"]);

    const { identityProviders, hasPasswordAuthentication, hasOnlyIdentityProviders } = useIdentityProviders();

    expect(identityProviders.value).toEqual(["AzureAD"]);
    expect(hasPasswordAuthentication.value).toBe(false);
    expect(hasOnlyIdentityProviders.value).toBe(true);
  });

  it("reacts to theme context changes", () => {
    const { hasOnlyIdentityProviders } = useIdentityProviders();

    expect(hasOnlyIdentityProviders.value).toBe(false);

    setAuthenticationTypes(["GoogleSSO"]);

    expect(hasOnlyIdentityProviders.value).toBe(true);
  });
});
