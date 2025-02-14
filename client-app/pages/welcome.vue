<template>
  <VcEmptyPage image="email.jpg" icon="outline-e-mail">
    <VcTypography tag="h1" class="order-first mb-3">
      {{ $t("pages.welcome.title") }}
    </VcTypography>

    <VcTypography class="mb-8 max-w-md text-center sm:text-left">
      {{ $t("pages.welcome.description") }}
    </VcTypography>

    <div class="flex justify-center sm:justify-start">
      <VcButton to="/" min-width="12rem">
        {{ $t("common.buttons.home") }}
      </VcButton>
    </div>
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
