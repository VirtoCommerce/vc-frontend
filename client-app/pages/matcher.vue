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
import { computedAsync, computedEager } from "@vueuse/core";
import { onBeforeUnmount, ref, watchEffect } from "vue";
import { useFetch, useLanguages, useNavigations } from "@/core/composables";
import { useStaticPage } from "@/shared/static-content";
import type { PageTemplate } from "@/shared/static-content";
import NotFound from "@/pages/404.vue";
import Category from "@/pages/category.vue";
import Product from "@/pages/product.vue";
import StaticPage from "@/pages/static-page.vue";

type EntityInfoType = {
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

type ResultType = {
  entity?: EntityInfoType;
  page?: PageTemplate;
};

type ContentItemType = {
  type: "page" | "blog" | "html";
  name: string;
  permalink: string;
  content: string;
};

type SlugInfoResultType = {
  contentItem?: ContentItemType;
  entityInfo?: EntityInfoType;
};

interface IProps {
  pathMatch?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  pathMatch: () => [],
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
  return paths.join("/");
});

const seoInfo = computedAsync<ResultType | undefined>(
  async () => {
    if (!seoUrl.value) {
      return undefined;
    }

    const result = await innerFetch<SlugInfoResultType>(
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
