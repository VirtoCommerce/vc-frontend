<template>
  <LandingPage>
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
  </LandingPage>
</template>

<script setup lang="ts">
import { computedAsync, computedEager } from "@vueuse/core";
import { defineAsyncComponent, onBeforeUnmount, ref, watchEffect } from "vue";
import { useFetch, useLanguages, useNavigations } from "@/core/composables";
import { LandingPage } from "@/shared/builder-io";
import { useStaticPage } from "@/shared/static-content";
import type { PageTemplate } from "@/shared/static-content";
import NotFound from "@/pages/404.vue";

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

const Category = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));

const { innerFetch } = useFetch();
const { currentLanguage } = useLanguages();
const { setMatchingRouteName } = useNavigations();

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
      `/storefrontapi/slug/${seoUrl.value}?culture=${currentLanguage.value!.cultureName}`,
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
  loading,
);

onBeforeUnmount(() => {
  setMatchingRouteName("");
});

watchEffect(() => {
  let matchingRouteName = "";

  switch (seoInfo.value?.entity?.objectType) {
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
