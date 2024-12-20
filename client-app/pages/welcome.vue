<template>
  <VcEmptyPage image="emails.webp" mobile-image="emails.webp">
    <template #description>
      <VcTypography tag="h1" class="mb-8">
        {{ $t("pages.welcome.title") }}
      </VcTypography>

      <VcTypography class="mb-8 max-w-lg text-center lg:text-left">
        {{ $t("pages.welcome.description") }}
      </VcTypography>
    </template>
    <template #actions>
      <div class="flex justify-center lg:justify-start">
        <VcButton to="/">
          {{ $t("common.buttons.home") }}
        </VcButton>
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
const { t } = useI18n();

usePageHead({
  title: t("pages.welcome.meta.title"),
});
</script>
