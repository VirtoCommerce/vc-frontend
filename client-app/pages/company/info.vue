<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.company.info.title'" />
    </div>

    <!-- TODO: Add content
    <div class="flex flex-col bg-white shadow-sm md:rounded md:border"></div>
    -->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";

const { t } = useI18n();

usePageHead({
  title: t("pages.company.info.meta.title"),
});

// openSaveCompanyAddressDialog(address?: AddressType): void
</script>
