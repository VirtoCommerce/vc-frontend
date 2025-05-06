<template>
  <div class="featured-brands">
    <VcTypography tag="h1" class="featured-brands__title">
      {{ $t("pages.brands.featured_brands_title") }}
    </VcTypography>

    <div v-if="loading" class="featured-brands__grid">
      <div v-for="i in 12" :key="i" class="featured-brands__skeleton-item">
        <VcImage class="featured-brands__skeleton-item-inner" />
      </div>
    </div>

    <div v-else class="featured-brands__grid">
      <FeaturedBrand v-for="brand in brands" :key="brand.id" :brand="brand" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrandFragment } from "@/core/api/graphql/types";
import FeaturedBrand from "@/shared/brands/components/featured-brand.vue";

interface IProps {
  brands: BrandFragment[];
  loading: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.featured-brands {
  --card-height: 100px;

  &__title {
    @apply mb-5;
  }

  &__grid {
    @apply grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]  gap-x-6 gap-y-5;
  }

  &__skeleton-item {
    @apply bg-additional-50 rounded-md h-[var(--card-height)] shadow-md flex items-center justify-center;
  }

  &__skeleton-item-inner {
    @apply animate-pulse;
  }
}
</style>
