<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <VcButton @click="externalSignIn">Azure</VcButton>
      <VcTypography tag="h1" class="mb-6 lg:mt-5">
        {{ $t("pages.sign_in.header") }}
      </VcTypography>

      <SignInForm />
    </template>
    <template #right>
      <VcImage
        :alt="$t('common.labels.background_image')"
        class="max-w-md"
        src="/static/images/sign-in/sign-in-page-image.webp"
        lazy
      />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { globals } from "@/core/globals";
import { getReturnUrlValue } from "@/core/utilities";
import { SignInForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

function externalSignIn() {
  const origin = location.origin;
  const returnUrl = getReturnUrlValue() ?? "/";

  const oidcUrl = new URL("/signin-oidc", origin);

  const callbackUrl = new URL("/callback", origin);
  callbackUrl.searchParams.set("returnUrl", returnUrl);

  const url = new URL("/externalsignin", origin);
  url.searchParams.set("authenticationType", "AzureAD");
  url.searchParams.set("oidcUrl", oidcUrl.href);
  url.searchParams.set("callbackUrl", callbackUrl.href);
  url.searchParams.set("storeId", globals.storeId);

  location.assign(url);
}

const { t } = useI18n();

usePageHead({
  title: t("pages.sign_in.meta.title"),
});
</script>
