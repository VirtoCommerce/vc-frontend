<template>
  <div v-if="isVisible && !loading && (hasPageDocumentContent || hasContent || objectType)" class="slug-content">
    <VirtoPages
                v-if="objectType === 'Pages' && hasPageDocumentContent"
                :page-document="pageDocumentContent"
                allow-set-meta />
    <CategoryComponent v-if="objectType === 'Category'" :category-id="slugInfo?.entityInfo?.objectId" allow-set-meta />
    <Product v-else-if="objectType === 'CatalogProduct'" :product-id="slugInfo?.entityInfo?.objectId" allow-set-meta />
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

interface IEmitArgs {
  value: StateType;
  items: string[];
}

interface IEmits {
  (event: "setState", args: IEmitArgs): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const VirtoPages = defineAsyncComponent(() => import("@/pages/virto-pages/virto-pages.vue"));
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

const {
  loading,
  slugInfo,
  objectType,
  hasContent,
  pageContent,
  fetchContent,
  hasPageDocumentContent,
  pageDocumentContent,
  fetchPageDocumentContent,
} = useSlugInfo(seoUrl);

enum ObjectType {
  CatalogProduct = "CatalogProduct",
  Category = "Category",
  ContentFile = "ContentFile",
  PageDocument = "Pages",
}

watchEffect(() => {
  if (loading.value) {
    emit("setState", { value: "loading", items: ["slugContent", "virtoPages"] });
  } else if (
    [ObjectType.Category, ObjectType.CatalogProduct].includes(objectType.value as ObjectType) ||
    pageContent.value
  ) {
    emit("setState", { value: "ready", items: ["slugContent"] });
    emit("setState", { value: "empty", items: ["virtoPages"] });
  } else if (pageDocumentContent.value) {
    emit("setState", { value: "ready", items: ["virtoPages"] });
    emit("setState", { value: "empty", items: ["slugContent"] });
  } else {
    emit("setState", { value: "empty", items: ["slugContent", "virtoPages"] });
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
    case ObjectType.PageDocument:
      void fetchPageDocumentContent();
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
