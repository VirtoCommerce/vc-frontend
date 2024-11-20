<template>
  <div v-if="isVisible && !loading && (hasContent || objectType)" class="slug-content">
    <CatalogComponent v-if="objectType === ObjectType.Catalog" />

    <CategoryComponent
      v-else-if="objectType === ObjectType.Category"
      :category-id="slugInfo?.entityInfo?.objectId"
      allow-set-meta
    />

    <Product
      v-else-if="objectType === ObjectType.CatalogProduct"
      :product-id="slugInfo?.entityInfo?.objectId"
      allow-set-meta
    />

    <StaticPage v-else-if="hasContent" />
  </div>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { defineAsyncComponent, onBeforeUnmount, watch, watchEffect } from "vue";
import { useNavigations } from "@/core/composables";
import { useSlugInfo } from "@/shared/common";
import { useStaticPage } from "@/shared/static-content";
import type { StateType } from "@/pages/matcher/priorityManager";

interface IProps {
  pathMatch?: string[];
  isVisible?: boolean;
}

interface IEmits {
  (event: "setState", value: StateType): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const CatalogComponent = defineAsyncComponent(() => import("@/pages/catalog.vue"));
const CategoryComponent = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));

const { setMatchingRouteName } = useNavigations();

const { staticPage } = useStaticPage();

const seoUrl = computedEager(() => {
  if (!props.pathMatch) {
    return "/";
  }
  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  const paths = props.pathMatch.filter(Boolean);
  return paths.join("/");
});

const { loading, slugInfo, objectType, hasContent, pageContent, fetchContent } = useSlugInfo(seoUrl);

enum ObjectType {
  Catalog = "Catalog",
  CatalogProduct = "CatalogProduct",
  Category = "Category",
  ContentFile = "ContentFile",
}

watchEffect(() => {
  if (loading.value) {
    emit("setState", "loading");
  } else if (
    [ObjectType.Catalog, ObjectType.Category, ObjectType.CatalogProduct].includes(objectType.value as ObjectType)
  ) {
    emit("setState", "ready");
  } else if (pageContent.value) {
    emit("setState", "ready");
  } else {
    emit("setState", "empty");
  }
});

watch(slugInfo, () => {
  const type = slugInfo.value?.entityInfo?.objectType;
  switch (type) {
    case ObjectType.CatalogProduct:
      setMatchingRouteName("Product");
      break;
    case ObjectType.Category:
      setMatchingRouteName("Category");
      break;
    case ObjectType.ContentFile:
      void fetchContent();
      break;
    default:
      clearState();
  }
});

watch(pageContent, (value) => {
  if (value) {
    staticPage.value = value;
  } else {
    clearState();
  }
});

function clearState() {
  staticPage.value = undefined;
}

onBeforeUnmount(() => {
  setMatchingRouteName("");
});
</script>

<style lang="scss">
.slug-content {
  @apply contents;
}
</style>
