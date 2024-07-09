<template>
  <TwoColumn class="max-w-screen-xl" :always-show-right="hasIdentityProviders">
    <template #left>
      <VcTypography tag="h1" class="mb-6 lg:mt-5">
        {{ $t("pages.sign_in.header") }}
      </VcTypography>

      <SignInForm v-if="hasLoginByEmail" />
    </template>
    <div v-if="hasIdentityProviders && hasLoginByEmail">OR</div>
    <template #right>
      <VcImage
        v-if="!hasIdentityProviders"
        :alt="$t('common.labels.background_image')"
        class="hidden max-w-md lg:block"
        src="/static/images/sign-in/sign-in-page-image.webp"
        lazy
      />
      <div v-else>
        <p>Google</p>
        <p>Microsoft</p>
      </div>
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { SignInForm } from "@/shared/account";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();

const hasIdentityProviders = computed(() => {
  return true;
});

const hasLoginByEmail = computed(() => {
  return true;
});

usePageHead({
  title: t("pages.sign_in.meta.title"),
});
</script>
