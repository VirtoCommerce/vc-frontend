import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, ref } from "vue";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { useIdentityProviders } from "./useIdentityProviders";

const themeContext = ref<{ storeSettings: { authenticationTypes?: string[] } }>({
  storeSettings: { authenticationTypes: [] },
});

const heldPolicyOf = vi.hoisted(() => vi.fn<(category: string, name?: string) => string | undefined>());

vi.mock("@/core/composables/useThemeContext", () => ({
  useThemeContext: () => ({ themeContext }),
}));

vi.mock("@/core/federation/contributions/declare", () => ({
  heldPolicyOf,
}));

function setAuthenticationTypes(authenticationTypes?: string[]): void {
  themeContext.value = { storeSettings: { authenticationTypes } };
}

describe("useIdentityProviders", () => {
  beforeEach(() => {
    setAuthenticationTypes([]);
    heldPolicyOf.mockReset();
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

  it("skips a type that has no button to render", () => {
    setAuthenticationTypes(["Password", "Unknown"]);

    const { identityProviders, hasIdentityProviders } = useIdentityProviders();

    expect(identityProviders.value).toEqual([]);
    expect(hasIdentityProviders.value).toBe(false);
  });

  it("keeps a type whose button a module registered", () => {
    setAuthenticationTypes(["Password", "Registered"]);
    useExtensionRegistry().register("identityProviders", "Registered", { component: defineComponent({}) });

    const { identityProviders } = useIdentityProviders();

    expect(identityProviders.value).toEqual(["Registered"]);
  });

  it("keeps a type whose button a pending plugin declared", () => {
    setAuthenticationTypes(["Password", "Declared"]);
    heldPolicyOf.mockReturnValue("reserve");

    const { identityProviders } = useIdentityProviders();

    expect(identityProviders.value).toEqual(["Declared"]);
  });
});
