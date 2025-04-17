<template>
  <Category :title is-root />
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { globals } from "@/core/globals";
import { useSlugInfo } from "@/shared/common";
import Category from "@/shared/catalog/components/category.vue";

const route = useRoute();
const { seoInfo } = useSlugInfo(route.path.slice(1));

const { i18n } = globals;

const catalogName = i18n.global.t("pages.catalog.title");
const title = computed(() => seoInfo.value?.pageTitle ?? catalogName);
const { title: pageTitle } = usePageTitle(seoInfo.value?.pageTitle ?? catalogName);

useSeoMeta({
  title: () => pageTitle.value,
  keywords: () => seoInfo?.value?.metaKeywords,
  description: () => seoInfo?.value?.metaDescription,
  ogTitle: () => pageTitle.value,
  ogDescription: () => seoInfo?.value?.metaDescription,
});
</script>
