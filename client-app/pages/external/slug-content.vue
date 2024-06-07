<template>
  <div v-if="!loading && (hasContent || objectType)" class="slug-content">
    <component :is="Category" v-if="objectType === 'Category'" :category-id="slugInfo?.entityInfo?.objectId" />
    <component :is="Product" v-else-if="objectType === 'CatalogProduct'" :product-id="slugInfo?.entityInfo?.objectId" />

    <component :is="StaticPage" v-else-if="hasContent" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, watchEffect } from "vue";
import { useNavigations } from "@/core/composables";
import { useSlugInfo } from "@/shared/common";
import { useStaticPage } from "@/shared/static-content";

interface IProps {
  seoUrl: string;
}

const props = defineProps<IProps>();

const Category = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));

const { setMatchingRouteName } = useNavigations();

const { staticPage } = useStaticPage();

const { loading, slugInfo, hasContent, pageContent, fetchContent } = useSlugInfo(computed(() => props.seoUrl));

const objectType = computed(() => {
  return slugInfo.value?.entityInfo?.objectType;
});

onBeforeUnmount(() => {
  setMatchingRouteName("");
});

watchEffect(async () => {
  let matchingRouteName = "";

  if (hasContent.value) {
    await fetchContent();
    if (pageContent.value) {
      staticPage.value = pageContent.value;
    }
  }

  switch (slugInfo.value?.entityInfo?.objectType) {
    case "CatalogProduct":
      matchingRouteName = "Product";
      break;
    case "Category":
      matchingRouteName = "Category";
      break;
  }

  setMatchingRouteName(matchingRouteName);
});
</script>

<style scoped lang="scss"></style>
