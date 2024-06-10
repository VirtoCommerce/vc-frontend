<template>
  <div v-if="!loading && (hasContent || objectType)" class="slug-content">
    <component :is="Category" v-if="objectType === 'Category'" :category-id="slugInfo?.entityInfo?.objectId" />
    <component :is="Product" v-else-if="objectType === 'CatalogProduct'" :product-id="slugInfo?.entityInfo?.objectId" />

    <component :is="StaticPage" v-else-if="hasContent" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, watch, watchEffect } from "vue";
import { useNavigations } from "@/core/composables";
import { useSlugInfo } from "@/shared/common";
import { useStaticPage } from "@/shared/static-content";
import type { StateType } from "@/pages/external/priorityManager";

interface IProps {
  seoUrl: string;
}

interface IEmits {
  (event: "setState", value: StateType): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const Category = defineAsyncComponent(() => import("@/pages/category.vue"));
const Product = defineAsyncComponent(() => import("@/pages/product.vue"));
const StaticPage = defineAsyncComponent(() => import("@/pages/static-page.vue"));

const { setMatchingRouteName } = useNavigations();

const { staticPage } = useStaticPage();

const { loading, slugInfo, hasContent, pageContent, fetchContent } = useSlugInfo(computed(() => props.seoUrl));

watch(loading, () => {
  if (loading.value) {
    emit("setState", "loading");
  }
});

const objectType = computed(() => {
  return slugInfo.value?.entityInfo?.objectType;
});

onBeforeUnmount(() => {
  setMatchingRouteName("");
});

watchEffect(async () => {
  let matchingRouteName = "";

  if (hasContent.value) {
    await fetchContent();
    if (pageContent.value) {
      staticPage.value = pageContent.value;
      emit("setState", "ready");
    } else {
      emit("setState", "empty");
    }
    return;
  }

  switch (slugInfo.value?.entityInfo?.objectType) {
    case "CatalogProduct":
      matchingRouteName = "Product";
      emit("setState", "ready");
      break;
    case "Category":
      matchingRouteName = "Category";
      emit("setState", "ready");
      break;
    default:
      if (!loading.value) {
        emit("setState", "empty");
      }
  }

  setMatchingRouteName(matchingRouteName);
});
</script>

<style scoped lang="scss"></style>
