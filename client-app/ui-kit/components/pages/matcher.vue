<template>
  <component
    :is="Category"
    v-if="seoInfo?.entity?.objectType === 'Category'"
    :category-id="seoInfo?.entity?.objectId"
  />

  <component
    :is="Product"
    v-else-if="seoInfo?.entity?.objectType === 'CatalogProduct'"
    :product-id="seoInfo?.entity?.objectId"
  />

  <component :is="StaticPage" v-else-if="seoInfo?.page" />

  <NotFound v-else-if="!loading" />
</template>

<script setup lang="ts">
import { asyncComputed, computedEager } from "@vueuse/core";
import { onBeforeUnmount, ref, watchEffect } from "vue";
import { useFetch, useLanguages, useNavigations } from "@/core/composables";
import { useStaticPage } from "@/shared/static-content";
import type { PageTemplate } from "@/shared/static-content";
import type { PropType } from "vue";
import NotFound from "@/pages/404.vue";
import Category from "@/pages/catalog.vue";
import Product from "@/pages/product.vue";
import StaticPage from "@/pages/static-page.vue";

type TEntityInfo = {
  id: string;
  objectId: string;
  objectType: string;
  slug: string;
  isActive: boolean;
  language: {
    cultureName: string;
    threeLetterLanguageName: string;
    twoLetterLanguageName: string;
    twoLetterRegionName: string;
    threeLetterRegionName: string;
  };
};

type TResult = {
  entity?: TEntityInfo;
  page?: PageTemplate;
};

type TContentItem = {
  type: "page" | "blog" | "html";
  name: string;
  permalink: string;
  content: string;
};

type TSlugInfoResult = {
  contentItem?: TContentItem;
  entityInfo?: TEntityInfo;
};

const props = defineProps({
  pathMatch: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const { innerFetch } = useFetch();
const { currentLanguage } = useLanguages();
const { setMatchedRouteName } = useNavigations();

const loading = ref(true);

const seoUrl = computedEager(() => {
  /**
   * NOTE: Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
   */
  const paths = props.pathMatch.filter(Boolean);
  return paths[paths.length - 1];
});

const seoInfo = asyncComputed<TResult | undefined>(
  async () => {
    if (!seoUrl.value) {
      return undefined;
    }
    const result = await innerFetch<TSlugInfoResult>(
      `/storefrontapi/slug/${seoUrl.value}?culture=${currentLanguage.value!.cultureName}`
    );

    if (result.contentItem?.type === "page") {
      const page: PageTemplate = JSON.parse(result.contentItem.content);
      useStaticPage(page);
      return { page };
    } else if (result.entityInfo) {
      return {
        entity: result.entityInfo,
      };
    } else {
      return undefined;
    }
  },
  undefined,
  loading
);

onBeforeUnmount(() => {
  setMatchedRouteName("");
});

watchEffect(() => {
  let matchedRouteName = "";

  switch (seoInfo.value?.entity?.objectType) {
    case "CatalogProduct":
      matchedRouteName = "Product";
      break;
    case "Category":
      matchedRouteName = "Category";
      break;
  }

  setMatchedRouteName(matchedRouteName);
});
</script>
