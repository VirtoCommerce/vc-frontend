import { computed } from "vue";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { heldPolicyOf } from "@/core/federation/contributions/declare";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_CATEGORIES } from "@/shared/common/constants/extensionPointsNames";

const PASSWORD_AUTHENTICATION_TYPE = "Password";

const BUILT_IN_PROVIDERS = new Set(
  Object.keys(import.meta.glob("../components/*-provider.vue")).map((path) =>
    path.slice(path.lastIndexOf("/") + 1, -"-provider.vue".length),
  ),
);

export function isBuiltInProvider(type: string): boolean {
  return BUILT_IN_PROVIDERS.has(type.toLowerCase());
}

export function useIdentityProviders() {
  const { themeContext } = useThemeContext();
  const { isRegistered } = useExtensionRegistry();

  const authenticationTypes = computed<string[]>(() =>
    themeContext.value.storeSettings?.authenticationTypes?.length
      ? themeContext.value.storeSettings.authenticationTypes
      : [PASSWORD_AUTHENTICATION_TYPE],
  );

  // A type with no button to render would leave the sign-in page an "or" divider with nothing under it
  const identityProviders = computed<string[]>(() =>
    authenticationTypes.value.filter((type) => type !== PASSWORD_AUTHENTICATION_TYPE && hasButton(type)),
  );

  const hasIdentityProviders = computed<boolean>(() => identityProviders.value.length > 0);

  const hasPasswordAuthentication = computed<boolean>(() =>
    authenticationTypes.value.includes(PASSWORD_AUTHENTICATION_TYPE),
  );

  const hasOnlyIdentityProviders = computed<boolean>(
    () => hasIdentityProviders.value && !hasPasswordAuthentication.value,
  );

  function hasButton(type: string): boolean {
    return (
      isBuiltInProvider(type) ||
      isRegistered(EXTENSION_CATEGORIES.identityProviders, type) ||
      heldPolicyOf(EXTENSION_CATEGORIES.identityProviders, type) !== undefined
    );
  }

  return {
    identityProviders,
    hasIdentityProviders,
    hasPasswordAuthentication,
    hasOnlyIdentityProviders,
  };
}
