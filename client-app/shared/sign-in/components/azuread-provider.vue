<template>
  <IdentityProvider :text="$t('pages.sign_in.providers.azure_ad.button_text')" icon="ms.svg" @sign-in="signIn" />
</template>

<script setup lang="ts">
import { useIdentityProvider } from "@/shared/sign-in/composables/useIdentityProvider";
import IdentityProvider from "./identity-provider.vue";

interface IProps {
  returnUrl: string;
}

const props = defineProps<IProps>();

const { signIn } = useIdentityProvider("AzureAD", "/signin-oidc", () => props.returnUrl);
</script>
