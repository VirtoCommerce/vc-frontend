<template>
  <VcContainer>
    <VcBreadcrumbs v-if="currentCategory?.breadcrumbs" class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <Category :category-id="categoryId" :currency-code-override="loyaltyCurrencyOverride" allow-set-meta />
  </VcContainer>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, toRefs, watch } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { buildBreadcrumbs } from "@/core/utilities";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import { useLoyaltyCatalogCurrency } from "@/shared/catalog/composables/useLoyaltyCatalogCurrency";
import { useSearchScore } from "@/shared/layout/composables/useSearchScore";
import Category from "@/shared/catalog/components/category.vue";

interface IProps {
  categoryId?: string;
}

const props = defineProps<IProps>();

const { categoryId } = toRefs(props);

const { category: currentCategory, fetchCategory } = useCategory();
const loyaltyCurrencyOverride = useLoyaltyCatalogCurrency();

const breadcrumbs = useBreadcrumbs(() => buildBreadcrumbs(currentCategory.value?.breadcrumbs));

const { isCategoryScope, isScopePending, holdScope } = useSearchScore();

// Runs before the child drops its scope or preparation; held a tick for a matcher mounting in its place.
onBeforeUnmount(() => {
  if (isCategoryScope.value || isScopePending.value) {
    void nextTick(holdScope());
  }
});

watch(
  categoryId,
  (newCategoryId) => {
    if (newCategoryId) {
      void fetchCategory({
        categoryId: newCategoryId,
        maxLevel: 0,
        currencyCode: loyaltyCurrencyOverride.value,
      });
    }
  },
  { immediate: true },
);
</script>
