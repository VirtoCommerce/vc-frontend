<template>
  <Category :key="key" :title is-root />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { computed, onBeforeMount, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { usePageHead } from "@/core/composables";
import { globals } from "@/core/globals";
import { useSlugInfo } from "@/shared/common";
import Category from "@/shared/catalog/components/category.vue";

const route = useRoute();
const { seoInfo } = useSlugInfo(route.path.slice(1));

const { i18n } = globals;
const catalogName = i18n.global.t("pages.catalog.title");
const title = computed(() => seoInfo.value?.pageTitle ?? catalogName);
const key = ref(0);

onBeforeMount(() => {
  if (route.meta.isBack) {
    key.value++;
  }
});

watchEffect(() => {
  if (!seoInfo.value) {
    return;
  }
  usePageHead({
    title: title.value,
    meta: {
      keywords: seoInfo?.value?.metaKeywords,
      description: seoInfo?.value?.metaDescription,
    },
  });

  useSeoMeta({
    ogTitle: title.value,
    ogDescription: seoInfo?.value?.metaDescription,
  });
});
</script>
