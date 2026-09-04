import { toValue } from "vue";
import { globals } from "@/core/globals";
import type { MaybeRefOrGetter } from "vue";

export function useIdentityProvider(authType: string, oidcUrl: string, returnUrl: MaybeRefOrGetter<string>) {
  function signIn() {
    const origin = location.origin;

    const oidcUrlObject = new URL(oidcUrl, origin);
    const callbackUrl = new URL("/auth/callback", origin);
    const url = new URL("/externalsignin", origin);

    callbackUrl.searchParams.set("returnUrl", toValue(returnUrl));
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
