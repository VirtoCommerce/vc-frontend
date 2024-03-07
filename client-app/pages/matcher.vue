<template>
  <LandingPage>
    <component
      :is="Category"
      v-if="slugInfo?.entityInfo?.objectType === 'Category'"
      :category-id="slugInfo?.entityInfo?.objectId"
    />
    <component
      :is="Product"
      v-else-if="slugInfo?.entityInfo?.objectType === 'CatalogProduct'"
      :product-id="slugInfo?.entityInfo?.objectId"
    />

    <component :is="StaticPage" v-else-if="slugInfo?.entityInfo?.objectType === 'ContentFile'" />

    <NotFound v-else-if="!loading" />
  </LandingPage>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { computed, defineAsyncComponent, onBeforeUnmount, watchEffect } from "vue";
import { getPage } from "@/core/api/graphql";
import { useNavigations } from "@/core/composables";
import { globals } from "@/core/globals";
import { LandingPage } from "@/shared/builder-io";
import { useSlugInfo } from "@/shared/common";
import { useStaticPage } from "@/shared/static-content";
import type { PageTemplate } from "@/shared/static-content";
import NotFound from "@/pages/404.vue";

interface IProps {
  pathMatch?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  pathMatch: () => [],
});

const Category = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));

const { setMatchingRouteName } = useNavigations();

const { staticPage } = useStaticPage();

const seoUrl = computedEager(() => {
  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  const paths = props.pathMatch.filter(Boolean);
  return paths.join("/");
});

const { loading, slugInfo } = useSlugInfo(seoUrl);

onBeforeUnmount(() => {
  setMatchingRouteName("");
});

const getPageParams = computed(() => {
  const { storeId } = globals;

  return { id: slugInfo?.value?.entityInfo?.objectId || "", storeId };
});

const { load: loadPage, result } = getPage(getPageParams);

watchEffect(async () => {
  let matchingRouteName = "";

  if (slugInfo.value?.entityInfo?.objectType === "ContentFile") {
    await loadPage();
    if (typeof result?.value?.page?.content !== "string") {
      return;
    }
    const { content, settings } = JSON.parse(result.value.page.content) as PageTemplate;
    staticPage.value = { content, settings };
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
