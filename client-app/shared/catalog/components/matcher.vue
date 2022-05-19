<template>
  <component v-if="seoInfo?.objectType === 'Category'" :is="Category" :category-seo-urls="seoInfo?.slug" />
  <component v-else-if="seoInfo?.objectType === 'CatalogProduct'" :is="Product" :product-id="seoInfo?.objectId" />
  <NotFound v-else-if="!loading" />
</template>

<script setup lang="ts">
import Category from "@/pages/category/category.vue";
import Product from "@/pages/product/product.vue";
import NotFound from "@/pages/404/404.vue";

import { PropType, ref } from "vue";
import { asyncComputed } from "@vueuse/core";
import { useFetch, useLocalization } from "@/core/composables";

type TSeoInfo = {
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

const props = defineProps({
  pathMatch: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const { innerFetch } = useFetch();
const { currentLocale } = useLocalization();

const loading = ref(true);

const seoInfo = asyncComputed<TSeoInfo | undefined>(
  async () => {
    const slug = props.pathMatch[props.pathMatch?.length - 1];

    if (!slug) {
      return;
    }

    const resultItems = await innerFetch<TSeoInfo[]>(`/storefrontapi/seoInfos/${slug}`);

    return resultItems.find(
      (item) => item.isActive && item.language.twoLetterLanguageName === currentLocale.value && item.slug === slug
    );
  },
  undefined,
  loading
);
</script>
