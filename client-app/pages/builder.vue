<template>
  <div>
    <component v-for="item in content" :key="item.id" :is="item.type" :model="item" />
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { usePageHead } from "@/core/composables";

type TPageContent = {
  id: string;
  name: string;
  type: string;
};

const props = defineProps({
  settings: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },

  content: {
    type: Array as PropType<TPageContent[]>,
    default: () => [],
  },
});

usePageHead({
  title: computed(() => props.settings?.seoInfo?.pageTitle || props.settings?.name),
  meta: {
    keywords: computed(() => props.settings?.seoInfo?.metaKeywords),
    description: computed(() => props.settings?.seoInfo?.metaDescription),
  },
});
</script>
