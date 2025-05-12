<template>
  <div class="brand-page">
    <VcContainer class="brand-page__top-container" :has-bg-image="false" max-width="85rem">
      <VcBreadcrumbs class="brand-page__breadcrumbs" :items="breadcrumbs" />

      <VcTypography v-if="brand?.image" tag="h1" class="brand-page__title">
        {{ brand?.name }}
      </VcTypography>

      <div v-if="brand?.image" class="brand-page__banner">
        <VcImage :src="brand?.image" lazy :alt="brand?.name" class="brand-page__banner-image" />
      </div>
    </VcContainer>

    <Category
      v-if="filterExpression"
      class="brand-page__products"
      max-width="85rem"
      filters-orientation="horizontal"
      :filter="filterExpression"
      hide-breadcrumbs
      hide-total
      view-mode="grid"
      :title="brand?.image ? $t('pages.brand.products_title') : brand?.name"
      columns-amount-desktop="5"
      :has-bg-image="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useGetBrand } from "@/core/api/graphql/catalog";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { getFilterExpressionForBrand } from "@/core/utilities/search/facets";
import Category from "@/shared/catalog/components/category.vue";

interface IProps {
  brandId?: string;
}

const props = defineProps<IProps>();
const brandId = toRef(props, "brandId");

const filterExpression = computed(() => {
  return getFilterExpressionForBrand(brand.value?.name ?? "");
});

const { t } = useI18n();
const { result } = useGetBrand(brandId.value ?? "");
const brand = computed(() => result.value?.brand);

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("pages.brands.title"), route: "/brands" },
  { title: brand.value?.name ?? "" },
]);

usePageHead({
  title: result.value?.brand?.name,
});
</script>

<style lang="scss">
.brand-page {
  &__breadcrumbs:not(:only-child) {
    @apply mb-5;
  }

  &__title {
    @apply mb-5;
  }

  &__banner {
    @apply flex items-center justify-center bg-additional-50 rounded xs:aspect-[3.75] aspect-[4/3];
  }

  &__banner-image {
    @apply w-full h-full object-cover;
  }
}
</style>
