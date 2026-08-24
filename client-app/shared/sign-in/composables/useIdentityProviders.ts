import { computed } from "vue";
import { useThemeContext } from "@/core/composables";

const PASSWORD_AUTHENTICATION_TYPE = "Password";

export function useIdentityProviders() {
  const { themeContext } = useThemeContext();

  const authenticationTypes = computed<string[]>(() =>
    themeContext.value.storeSettings?.authenticationTypes?.length
      ? themeContext.value.storeSettings.authenticationTypes
      : [PASSWORD_AUTHENTICATION_TYPE],
  );

  const identityProviders = computed<string[]>(() =>
    authenticationTypes.value.filter((type) => type !== PASSWORD_AUTHENTICATION_TYPE),
  );

  const hasIdentityProviders = computed<boolean>(() => identityProviders.value.length > 0);

  const hasPasswordAuthentication = computed<boolean>(() =>
    authenticationTypes.value.includes(PASSWORD_AUTHENTICATION_TYPE),
  );

  const hasOnlyIdentityProviders = computed<boolean>(
    () => hasIdentityProviders.value && !hasPasswordAuthentication.value,
  );

  return {
    identityProviders,
    hasIdentityProviders,
    hasPasswordAuthentication,
    hasOnlyIdentityProviders,
  };
}
