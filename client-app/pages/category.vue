<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <Category :category-id="categoryId" allow-set-meta />
  </VcContainer>
</template>

<script setup lang="ts">
import { onMounted, toRefs } from "vue";
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

onMounted(() => {
  if (categoryId.value) {
    void fetchCategory({ categoryId: categoryId.value, maxLevel: 0 });
  }
});
</script>
