<template>
  <div v-if="isMobile" class="skeleton-mobile">
    <ProductSkeletonGrid v-for="i in itemsCount" :key="i" />
  </div>

  <div v-else class="skeleton-desktop">
    <WishlistProductItemSkeleton v-for="i in itemsCount" :key="i" class="skeleton-desktop__item" />
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
.skeleton-mobile {
  @apply grid grid-cols-2 gap-x-4 gap-y-6;
}

.skeleton-desktop {
  @apply flex flex-col rounded border bg-additional-50 shadow-sm;

  &__item {
    @apply even:bg-neutral-50;
  }
}
</style>
