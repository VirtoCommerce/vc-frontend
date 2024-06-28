<template>
  <div v-if="!loading && (hasContent || objectType)" class="slug-content">
    <CategoryComponent v-if="objectType === 'Category'" :category-id="slugInfo?.entityInfo?.objectId" allow-set-meta />
    <Product v-else-if="objectType === 'CatalogProduct'" :product-id="slugInfo?.entityInfo?.objectId" allow-set-meta />
    <StaticPage v-else-if="hasContent" />
  </div>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, watch, watchEffect } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useNavigations } from "@/core/composables";
import { useSlugInfo } from "@/shared/common";
import { useStaticPage } from "@/shared/static-content";
import type { StateType } from "@/pages/matcher/priorityManager";

interface IProps {
  pathMatch?: string[];
}

interface IEmits {
  (event: "setState", value: StateType): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const CategoryComponent = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));

const { setMatchingRouteName } = useNavigations();

const { staticPage } = useStaticPage();

const MAIN_PAGE_RESERVED_SLUG = "__index__home__page__";

const seoUrl = computedEager(() => {
  if (!props.pathMatch) {
    return MAIN_PAGE_RESERVED_SLUG;
  }
  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  const paths = props.pathMatch.filter(Boolean);
  return paths.join("/");
});

const { loading, slugInfo, hasContent, pageContent, fetchSlugInfo, fetchContent } = useSlugInfo(
  computed(() => seoUrl.value),
);

const objectType = computed(() => {
  return slugInfo.value?.entityInfo?.objectType || "";
});

enum ObjectType {
  CatalogProduct = "CatalogProduct",
  Category = "Category",
  ContentFile = "ContentFile",
}

watchEffect(() => {
  if (loading.value) {
    emit("setState", "loading");
  } else if ([ObjectType.Category, ObjectType.CatalogProduct].includes(objectType.value as ObjectType)) {
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

onMounted(() => {
  void fetchSlugInfo();
});

onBeforeRouteUpdate((to, from) => {
  if (to.path !== from.path) {
    clearState();
    void fetchSlugInfo();
  }
});

onBeforeUnmount(() => {
  setMatchingRouteName("");
});
</script>
