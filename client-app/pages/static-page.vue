<template>
  <div>
    <component v-for="item in template.content" :key="item.id" :is="item.type" :model="item" />
  </div>
</template>

<script setup lang="ts">
import { computed, unref } from "vue";
import { usePageHead, useStaticPage } from "@/core/composables";

const template = useStaticPage();

usePageHead({
  title: computed(() => unref(template).settings?.seoInfo?.pageTitle || unref(template).settings?.name),
  meta: {
    keywords: computed(() => unref(template).settings?.seoInfo?.metaKeywords),
    description: computed(() => unref(template).settings?.seoInfo?.metaDescription),
  },
});
</script>
