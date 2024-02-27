<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <h1 v-t="'pages.404.error_code'" class="text-black-800 mb-5 text-7xl font-black md:text-8xl"></h1>
      <h2 v-t="'pages.404.error_text'" class="text-black-800 mb-2 text-2xl font-bold md:text-4xl"></h2>
      <p v-t="'pages.404.message'" class="mb-10 text-base leading-relaxed text-gray-700 md:text-xl"></p>
      <div>
        <VcButton to="/" class="w-40">
          {{ $t("pages.404.home_button") }}
        </VcButton>
      </div>
    </template>
    <template #right>
      <VcImage src="/static/images/errors/404.webp" :alt="$t('pages.404.img_alt')" class="w-full max-w-md" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import TwoColumn from "@/shared/layout/components/two-column.vue";

const { t } = useI18n();

usePageHead({
  title: `${t("pages.404.error_code")} ${t("pages.404.error_text")}`,
});
</script>
