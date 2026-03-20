<template>
  <VcContainer>
    <VcBreadcrumbs v-if="currentCategory?.breadcrumbs" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <Category :category-id="categoryId" allow-set-meta />
  </VcContainer>
</template>

<script setup lang="ts">
import { toRefs, watch } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { buildBreadcrumbs } from "@/core/utilities";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import Category from "@/shared/catalog/components/category.vue";

interface IProps {
  categoryId?: string;
}

const props = defineProps<IProps>();

const { categoryId } = toRefs(props);

const { category: currentCategory, fetchCategory } = useCategory();

const breadcrumbs = useBreadcrumbs(() => buildBreadcrumbs(currentCategory.value?.breadcrumbs));

watch(
  categoryId,
  (newCategoryId) => {
    if (newCategoryId) {
      void fetchCategory({ categoryId: newCategoryId, maxLevel: 0 });
    }
  },
  { immediate: true },
);
</script>
