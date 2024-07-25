<template>
  <IdentityProvider text="Sign in with Active Directory" icon="/static/images/sign-in/ms.svg" @sign-in="signIn" />
</template>

<script setup lang="ts">
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
import IdentityProvider from "./identity-provider.vue";

const AUTHENTICATION_TYPE = "AzureAD";

function signIn() {
  const origin = location.origin;
  const returnUrl = getReturnUrlValue() ?? "/";

  const oidcUrl = new URL("/signin-oidc", origin);
  const callbackUrl = new URL("/callback", origin);
  const url = new URL("/externalsignin", origin);

  callbackUrl.searchParams.set("returnUrl", returnUrl);
  url.searchParams.set("authenticationType", AUTHENTICATION_TYPE);
  url.searchParams.set("oidcUrl", oidcUrl.href);
  url.searchParams.set("callbackUrl", callbackUrl.href);
  url.searchParams.set("storeId", globals.storeId);

  location.assign(url);
}
</script>
