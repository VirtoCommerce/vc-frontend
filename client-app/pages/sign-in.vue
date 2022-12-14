<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <h1 class="uppercase tracking-wide text-3xl lg:text-4xl font-bold mb-8 lg:mt-5" v-t="'pages.sign_in.header'"></h1>
      <SignInForm @succeeded="onSignIn" />
    </template>
    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-in/sign-in-page-image.webp" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { SignInForm } from "@/shared/account";
import { useRoute } from "vue-router";
import { TwoColumn } from "@/shared/layout";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";

const { query } = useRoute();
const { t } = useI18n();

usePageHead({
  title: t("pages.sign_in.meta.title"),
});

async function onSignIn() {
  // FIXME: The `ReturnUrl` parameter is hardcoded in vc-storefront
  location.href = (query.returnUrl as string) || (query.ReturnUrl as string) || "/";
}
</script>
