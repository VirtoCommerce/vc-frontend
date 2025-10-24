<template>
  <div v-if="isMobile" class="wishlist-products-skeleton wishlist-products-skeleton--mobile">
    <ProductSkeletonGrid v-for="i in itemsCount" :key="i" class="wishlist-products-skeleton__item" />
  </div>

  <div v-else class="wishlist-products-skeleton wishlist-products-skeleton--desktop">
    <WishlistProductItemSkeleton v-for="i in itemsCount" :key="i" class="wishlist-products-skeleton__item" />
  </div>
</template>

<script lang="ts" setup>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ProductSkeletonGrid } from "@/shared/catalog";
import { WishlistProductItemSkeleton } from "@/shared/wishlists";

interface IProps {
  itemsCount: number;
}

defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);

const isMobile = breakpoints.smaller("lg");
</script>

<style lang="scss">
.wishlist-products-skeleton {
  &--mobile {
    @apply grid grid-cols-2 gap-x-4 gap-y-6;
  }

  &--desktop {
    @apply flex flex-col rounded border bg-additional-50 shadow-sm;
  }

  &--desktop &__item {
    @apply even:bg-neutral-50;
  }
}
</style>
