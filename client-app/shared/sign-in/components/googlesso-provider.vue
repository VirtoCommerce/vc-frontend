<template>
  <IdentityProvider
    :text="$t('pages.sign_in.providers.google_sso.button_text')"
    icon="/static/images/sign-in/google.webp"
    @sign-in="signIn"
  />
</template>

<script setup lang="ts">
import { useIdentityProvider } from "@/shared/sign-in/components/useIdentityProvider";
import IdentityProvider from "./identity-provider.vue";

const { signIn } = useIdentityProvider("GoogleSSO", "/signin-google");
</script>
