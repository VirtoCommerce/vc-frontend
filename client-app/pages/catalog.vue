<template>
  <Category :title is-root />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { usePageHead } from "@/core/composables";
import { globals } from "@/core/globals";
import { getHeadInstance } from "@/core/utilities/head";
import { useSlugInfo } from "@/shared/common";
import Category from "@/shared/catalog/components/category.vue";

const route = useRoute();
const { seoInfo } = useSlugInfo(route.path.slice(1));

const { i18n } = globals;
const catalogName = i18n.global.t("pages.catalog.title");
const title = computed(() => seoInfo.value?.pageTitle ?? catalogName);
const head = getHeadInstance();

watchEffect(() => {
  if (!seoInfo.value) {
    return;
  }
  usePageHead(
    {
      title: title.value,
      meta: {
        keywords: seoInfo?.value?.metaKeywords,
        description: seoInfo?.value?.metaDescription,
      },
    },
    head,
  );

  useSeoMeta({
    ogTitle: title.value,
    ogDescription: seoInfo?.value?.metaDescription,
  });
});
</script>
