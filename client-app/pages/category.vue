<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <Category allow-set-meta />
  </VcContainer>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@/core/composables";
import { buildBreadcrumbs } from "@/core/utilities";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import Category from "@/shared/catalog/components/category.vue";

const { category: currentCategory } = useCategory();

const breadcrumbs = useBreadcrumbs(() => buildBreadcrumbs(currentCategory.value?.breadcrumbs));
</script>
