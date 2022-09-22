<template>
  <component
    v-if="seoInfo?.entity?.objectType === 'Category'"
    :is="Category"
    :category-id="seoInfo?.entity?.objectId"
  />

  <component
    v-else-if="seoInfo?.entity?.objectType === 'CatalogProduct'"
    :is="Product"
    :product-id="seoInfo?.entity?.objectId"
  />

  <component v-else-if="seoInfo?.page" :is="StaticPage" />

  <NotFound v-else-if="!loading" />
</template>

<script setup lang="ts">
import Category from "@/pages/catalog.vue";
import Product from "@/pages/product-template.vue";
import StaticPage from "@/pages/static-page.vue";
import NotFound from "@/pages/404.vue";

import { onBeforeUnmount, PropType, ref, watchEffect } from "vue";
import { PageTemplate } from "@/core/types";
import { asyncComputed, computedEager } from "@vueuse/core";
import { useFetch, useLanguages, useStaticPage } from "@/core/composables";
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

const seoUrl = computedEager(() => props.pathMatch[props.pathMatch?.length - 1]);
const seoInfo = asyncComputed<TResult | undefined>(
  async () => {
    if (!seoUrl.value) {
      return undefined;
    }

    const postfix = (window as any)["__postfix__"] || "";

    const result = await innerFetch<TSlugInfoResult>(
      `/storefrontapi/slug/${seoUrl.value}?culture=${currentLanguage.value!.cultureName}${postfix}`
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
