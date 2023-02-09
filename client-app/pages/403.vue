<template>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <h1 v-t="'pages.403.error_code'" class="text-primary text-7xl md:text-8xl font-black mb-5"></h1>
      <h2 v-t="'pages.403.error_text'" class="text-black-800 text-2xl md:text-4xl font-bold mb-2"></h2>
      <p v-t="'pages.403.message'" class="text-gray-700 text-base md:text-xl leading-relaxed mb-10"></p>
      <div>
        <VcButton to="/" size="md" class="w-40 uppercase">
          {{ $t("pages.403.home_button") }}
        </VcButton>
      </div>
    </template>
    <template #right>
      <VcImage src="/static/images/errors/403.webp" :alt="$t('pages.403.img_alt')" class="w-full max-w-md" lazy />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { TwoColumn } from "@/shared/layout";

const { t } = useI18n();

usePageHead({
  title: `${t("pages.403.error_code")} ${t("pages.403.error_text")}`,
});
</script>
