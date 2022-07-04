<template>
  <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
    <template v-for="block in template.content" :key="block.id">
      <div class="block py-8" v-if="!block.hidden">
        <component :is="block.type" :model="block" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTemplate } from "./useTemplate";
import { usePageHead } from "@/core/composables";
import { computed } from "vue";

const { template } = useTemplate("/demo-page");

usePageHead({
  title: computed(() => template.value.settings?.seoInfo?.pageTitle || template.value.settings?.name),
  meta: {
    keywords: computed(() => template.value.settings?.seoInfo?.metaKeywords),
    description: computed(() => template.value.settings?.seoInfo?.metaDescription),
  },
});
</script>
