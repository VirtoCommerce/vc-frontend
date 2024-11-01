<template>
  <Category />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { watchEffect } from "vue";
import { useRoute } from "vue-router";
import { usePageHead } from "@/core/composables";
import { useSlugInfo } from "@/shared/common";
import Category from "@/shared/catalog/components/category.vue";

const route = useRoute();
const { seoInfo } = useSlugInfo(route.path.slice(1));

watchEffect(() => {
  if (!seoInfo.value) {
    return;
  }
  usePageHead({
    title: seoInfo.value?.pageTitle,
    meta: {
      keywords: seoInfo?.value?.metaKeywords,
      description: seoInfo?.value?.metaDescription,
    },
  });

  useSeoMeta({
    ogTitle: seoInfo.value?.pageTitle,
    ogDescription: seoInfo?.value?.metaDescription,
  });
});
</script>
