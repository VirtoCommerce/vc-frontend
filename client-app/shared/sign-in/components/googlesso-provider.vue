<template>
  <IdentityProvider
    :text="$t('pages.sign_in.providers.google_sso.button_text')"
    icon="/static/images/sign-in/google.webp"
    @sign-in="signIn"
  />
</template>

<script setup lang="ts">
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
import IdentityProvider from "./identity-provider.vue";

const AUTHENTICATION_TYPE = "GoogleSSO";
const DEFAULT_RETURN_URL = "/";

function signIn() {
  const origin = location.origin;
  const returnUrl = getReturnUrlValue() ?? DEFAULT_RETURN_URL;

  const oidcUrl = new URL("/signin-google", origin);
  const callbackUrl = new URL("/auth/callback", origin);
  const url = new URL("/externalsignin", origin);

  callbackUrl.searchParams.set("returnUrl", returnUrl);
  url.searchParams.set("authenticationType", AUTHENTICATION_TYPE);
  url.searchParams.set("oidcUrl", oidcUrl.href);
  url.searchParams.set("callbackUrl", callbackUrl.href);
  url.searchParams.set("storeId", globals.storeId);

  location.assign(url);
}
</script>
