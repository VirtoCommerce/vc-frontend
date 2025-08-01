<template>
  <div v-if="isVisible && !loading && (hasContent || objectType || hasPageDocumentContent)" class="slug-content">
    <CatalogComponent v-if="objectType === ObjectType.Catalog" />

    <CategoryComponent
      v-else-if="objectType === 'Category'"
      :category-id="slugInfo?.entityInfo?.objectId"
      allow-set-meta
    />

    <BrandsPage v-else-if="objectType === ObjectType.Brands" />

    <BrandPage v-else-if="objectType === ObjectType.Brand" :brand-id="slugInfo?.entityInfo?.objectId" allow-set-meta />

    <Product
      v-else-if="objectType === ObjectType.CatalogProduct"
      :product-id="slugInfo?.entityInfo?.objectId"
      allow-set-meta
    />

    <NewsArticlePage
      v-else-if="objectType === ObjectType.NewsArticle"
      :article-id="slugInfo?.entityInfo?.objectId ?? ''"
    />

    <VirtoPage v-else-if="hasPageDocumentContent" :page-document="pageDocumentContent" />

    <StaticPage v-else-if="hasContent" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, watch, watchEffect, computed } from "vue";
import { useNavigations } from "@/core/composables";
import { useSlugInfo } from "@/shared/common";
import { useStaticPage } from "@/shared/static-content";
import type { StateType, UpdateStateEventArgs } from "@/pages/matcher/priorityManager";

interface IProps {
  pathMatch?: string[];
  isVisible?: boolean;
}

interface IEmits {
  (event: "setState", value: UpdateStateEventArgs): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const CatalogComponent = defineAsyncComponent(() => import("@/pages/catalog.vue"));
const CategoryComponent = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const VirtoPage = defineAsyncComponent(() => import("@/pages/matcher/virto-pages/virto-pages.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));
const BrandsPage = defineAsyncComponent(() => import("@/pages/brands.vue"));
const BrandPage = defineAsyncComponent(() => import("@/pages/brand.vue"));
const NewsArticlePage = defineAsyncComponent(() => import("@/modules/news/pages/news-article.vue"));

const { setMatchingRouteName } = useNavigations();

const { staticPage } = useStaticPage();

const seoUrl = computed(() => {
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
  hasPageDocumentContent,
  pageDocumentContent,
  pageContent,
  fetchContent,
  fetchPageDocumentContent,
} = useSlugInfo(seoUrl);

enum ObjectType {
  Catalog = "Catalog",
  CatalogProduct = "CatalogProduct",
  Category = "Category",
  ContentFile = "ContentFile",
  VirtoPages = "Pages",
  Brands = "Brands",
  Brand = "Brand",
  NewsArticle = "NewsArticle",
}

watchEffect(() => {
  if (loading.value) {
    emitState("loading");
  } else if (
    [
      ObjectType.Catalog,
      ObjectType.Category,
      ObjectType.CatalogProduct,
      ObjectType.Brands,
      ObjectType.Brand,
      ObjectType.NewsArticle,
    ].includes(objectType.value as ObjectType)
  ) {
    emitState("ready");
  } else if (pageDocumentContent.value) {
    emitState("ready");
  } else if (pageContent.value) {
    emitState("ready");
  } else if (slugInfo.value?.redirectUrl) {
    emitState("redirect", slugInfo.value.redirectUrl);
  } else {
    emitState("empty");
  }
});

function emitState(state: StateType, redirectUrl?: string) {
  emit("setState", { state, redirectUrl });
}

watch(slugInfo, () => {
  const type = slugInfo.value?.entityInfo?.objectType;
  switch (type) {
    case ObjectType.CatalogProduct:
      setMatchingRouteName("Product");
      break;
    case ObjectType.Category:
      setMatchingRouteName("Category");
      break;
    case ObjectType.NewsArticle:
      setMatchingRouteName("NewsArticle");
      break;
    case ObjectType.ContentFile:
      void fetchContent();
      break;
    case ObjectType.VirtoPages:
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
