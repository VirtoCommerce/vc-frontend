<template>
  <IdentityProvider
    :text="$t('pages.sign_in.providers.azure_ad.button_text')"
    icon="/static/images/sign-in/ms.svg"
    @sign-in="signIn"
  />
</template>

<script setup lang="ts">
import { useIdentityProvider } from "@/shared/sign-in/components/useIdentityProvider";
import IdentityProvider from "./identity-provider.vue";

const { signIn } = useIdentityProvider("AzureAD", "/signin-oidc");
</script>
