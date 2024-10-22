import { useThemeContext } from "@/core/composables";
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";

export function useIdentityProvider(authType: string, oidcUrl: string) {
  const { themeContext } = useThemeContext();

  function signIn() {
    const origin = location.origin;
    const returnUrl = getReturnUrlValue() ?? themeContext.value.settings.default_return_url ?? "/";

    const oidcUrlObject = new URL(oidcUrl, origin);
    const callbackUrl = new URL("/auth/callback", origin);
    const url = new URL("/externalsignin", origin);

    callbackUrl.searchParams.set("returnUrl", returnUrl);
    url.searchParams.set("authenticationType", authType);
    url.searchParams.set("oidcUrl", oidcUrlObject.href);
    url.searchParams.set("callbackUrl", callbackUrl.href);
    url.searchParams.set("storeId", globals.storeId);

    location.assign(url);
  }

  return {
    signIn,
  };
}
