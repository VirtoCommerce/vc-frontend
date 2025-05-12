<template>
  <VcContainer class="brands">
    <VcBreadcrumbs class="brands__breadcrumbs" :items="breadcrumbs" />
    <VcTypography tag="h1" class="brands__title"> Brand Name </VcTypography>
    <Category filters-orientation="horizontal" />
  </VcContainer>
</template>

<script setup lang="ts">
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import Category from "@/shared/catalog/components/category.vue";

const breadcrumbs = useBreadcrumbs([{ title: "Brand Name" }]);

usePageHead({
  title: "Brand Name",
});
</script>
