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

  <component
    v-else-if="seoInfo?.page"
    :is="PageBuilder"
    :settings="seoInfo?.page?.settings"
    :content="seoInfo?.page?.content"
  />

  <NotFound v-else-if="!loading" />
</template>

<script setup lang="ts">
import Category from "@/pages/category.vue";
import Product from "@/pages/product.vue";
import PageBuilder from "@/pages/builder.vue";
import NotFound from "@/pages/404.vue";

import { onBeforeUnmount, PropType, ref, watchEffect } from "vue";
import { asyncComputed, computedEager } from "@vueuse/core";
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

    try {
      // Load page by slug
      const page = await innerFetch<TPageInfo>(`/storefrontapi/content/pages`, "POST", {
        permalink: `/${seoUrl.value}`,
      });

      if (page) {
        return {
          page,
        };
      }
    } catch (err) {
      // If no page found load entity by slug
      const resultItems = await innerFetch<TEntityInfo[]>(`/storefrontapi/seoInfos/${seoUrl.value}`);

      if (resultItems && resultItems.length) {
        const entity = resultItems.find(
          (item) =>
            item.isActive &&
            item.language.cultureName === currentLanguage.value!.cultureName &&
            item.slug === seoUrl.value
        );
        if (entity) {
          return {
            entity,
          };
        }
      }
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
