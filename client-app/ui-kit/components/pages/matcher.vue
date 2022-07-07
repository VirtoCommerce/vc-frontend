<template>
  <component
    v-if="seoInfo?.entity?.objectType === 'Category'"
    :is="Category"
    :category-seo-urls="seoInfo?.entity?.slug"
  />

  <component
    v-else-if="seoInfo?.entity?.objectType === 'CatalogProduct'"
    :is="Product"
    :product-id="seoInfo?.entity?.objectId"
  />

  <component
    v-else-if="seoInfo?.page"
    :is="PageBuilder"
    :settings="seoInfo.page.settings"
    :content="seoInfo.page.content"
  />

  <NotFound v-else-if="!loading" />
</template>

<script setup lang="ts">
import Category from "@/pages/category.vue";
import Product from "@/pages/product.vue";
import PageBuilder from "@/pages/builder.vue";
import NotFound from "@/pages/404.vue";

import { onBeforeUnmount, PropType, ref, watchEffect } from "vue";
import { asyncComputed } from "@vueuse/core";
import { useFetch, useLanguages } from "@/core/composables";
import { useNavigations } from "@/shared/layout";

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

type TPageInfo = {
  settings: {
    name: string;
    permalink: string;
  };
  content: any[];
};

type TResult = {
  entity?: TEntityInfo;
  page?: TPageInfo;
};

type TContentItem = {
  type: "page" | "blog" | "html";
  name: string;
  permalink: string;
  content: string;
};

type TSlugInfoResult = {
  contentItem: TContentItem;
  entityInfo: TEntityInfo;
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

const seoInfo = asyncComputed<TResult | undefined>(
  async () => {
    const slug = props.pathMatch[props.pathMatch?.length - 1];

    if (!slug) {
      return undefined;
    }

    // If no page found load entity by slug
    const result = await innerFetch<TSlugInfoResult>(
      `/storefrontapi/slug/${slug}?culture=${currentLanguage.value!.cultureName}`
    );

    if (result.contentItem && result.contentItem.type == "page") {
      const page = JSON.parse(result.contentItem.content) as TPageInfo;
      return { page };
    }

    if (result.entityInfo) {
      return {
        entity: result.entityInfo,
      };
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
