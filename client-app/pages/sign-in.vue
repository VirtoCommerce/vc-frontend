<template>
  <TwoColumn class="max-w-screen-xl">
    <template #left>
      <VcTypography tag="h1" class="mb-6 lg:mt-5">
        {{ $t("pages.sign_in.header") }}
      </VcTypography>

      <SignInForm />
    </template>
    <template #right>
      <VcImage class="max-w-md" src="/static/images/sign-in/sign-in-page-image.webp" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { SignInForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();

usePageHead({
  title: t("pages.sign_in.meta.title"),
});
</script>
