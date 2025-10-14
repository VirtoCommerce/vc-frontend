<template>
  <div class="brand-page">
    <VcContainer class="brand-page__top-container" :has-bg-image="false">
      <VcBreadcrumbs class="brand-page__breadcrumbs" :items="breadcrumbs" />

      <VcTypography v-if="hasBannerOrLogo" tag="h1" class="brand-page__title" data-test-id="brand-title">
        {{ brand?.name }}
      </VcTypography>

      <div v-if="brand?.bannerUrl" class="brand-page__banner" data-test-id="brand-banner">
        <VcImage
          :src="brand?.bannerUrl"
          lazy
          :alt="brand?.name"
          class="brand-page__banner-image"
          :size-suffix="imageSizeSuffix"
        />
      </div>

      <div v-else-if="brand?.logoUrl" class="brand-page__logo" data-test-id="brand-logo">
        <VcImage
          :src="brand?.logoUrl"
          lazy
          :alt="brand?.name"
          class="brand-page__logo-image"
          :size-suffix="imageSizeSuffix"
        />
      </div>

      <Category
        v-if="brand"
        data-test-id="brand-products"
        class="brand-page__products"
        filters-orientation="horizontal"
        :filter="filterExpression"
        hide-total
        view-mode="grid"
        :title="hasBannerOrLogo ? $t('pages.brand.products_title') : brand?.name"
        columns-amount-desktop="5"
        :has-bg-image="false"
        :facets-to-hide="['BRAND']"
      />
    </VcContainer>

    <VcEmptyView v-if="!loading && !brand" :text="$t('pages.brands.no_results')" />
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { computed, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useGetBrand } from "@/core/api/graphql/catalog";
import { useBreadcrumbs, usePageTitle } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { getFilterExpressionForBrand } from "@/core/utilities/search/facets";
import Category from "@/shared/catalog/components/category.vue";

const props = defineProps<IProps>();

interface IProps {
  brandId?: string;
}

const brandId = toRef(props, "brandId");

const filterExpression = computed(() => {
  return getFilterExpressionForBrand(brand.value?.brandPropertyValue);
});

const { t } = useI18n();

const { updateLocalizedUrl } = useLanguages();

const breakpoints = useBreakpoints(breakpointsTailwind);

const { result, loading } = useGetBrand(brandId.value ?? "");

const brand = computed(() => result.value?.brand);
const hasBannerOrLogo = computed(() => brand.value?.bannerUrl || brand.value?.logoUrl);

const imageSizeSuffix = computed(() => {
  if (breakpoints.greaterOrEqual("lg").value) {
    return undefined;
  }

  if (breakpoints.greaterOrEqual("md").value) {
    return "lg";
  }

  if (breakpoints.greaterOrEqual("sm").value) {
    return "md";
  }

  return "sm";
});

const { title: pageTitle } = usePageTitle(brand.value?.name);

const breadcrumbs = useBreadcrumbs(() => [
  {
    title: t("pages.brands.title"),
    route: (() => {
      const permalink = brand.value?.permalink ?? "";
      const cleanPermalink = permalink.startsWith("/") ? permalink.slice(1) : permalink;
      const brandSegment = cleanPermalink.split("/")[0];
      return `/${brandSegment}`;
    })(),
  },
  { title: brand.value?.name ?? "" },
]);

useSeoMeta({
  title: pageTitle,
  keywords: brand.value?.name,
  description: brand?.value?.description,
  ogUrl: window.location.toString(),
  ogTitle: pageTitle,
  ogDescription: brand?.value?.description,
  ogImage: brand?.value?.logoUrl,
  ogType: "website",
});

watch(
  brand,
  () => {
    updateLocalizedUrl(brand.value?.permalink);
  },
  { immediate: true },
);
</script>

<style lang="scss">
.brand-page {
  @apply bg-neutral-50 grow;

  &__top-container {
    --pb: 0;

    @media (min-width: theme("screens.lg")) {
      --pb: 1rem;
    }
  }

  &__breadcrumbs:not(:only-child) {
    @apply mb-5;
  }

  &__title {
    @apply mb-5;
  }

  &__banner,
  &__logo {
    @apply flex items-center justify-center bg-additional-50 rounded sm:aspect-[3.75] aspect-[4/3];
  }

  &__banner-image {
    @apply w-full h-full object-cover;
  }

  &__logo {
    @apply p-5;
  }

  &__logo-image {
    @apply max-h-full;
  }

  &__products {
    @apply pt-[var(--pt)];
  }
}
</style>
