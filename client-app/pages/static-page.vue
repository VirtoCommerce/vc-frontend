<template>
  <div>
    <component v-for="item in template.content" :key="item.id" :is="item.type" :model="item" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePageHead, useStaticPage } from "@/core/composables";

const template = useStaticPage();

usePageHead({
  title: computed(() => template.settings?.seoInfo?.pageTitle || template.settings?.name),
  meta: {
    keywords: computed(() => template.settings?.seoInfo?.metaKeywords),
    description: computed(() => template.settings?.seoInfo?.metaDescription),
  },
});
</script>
