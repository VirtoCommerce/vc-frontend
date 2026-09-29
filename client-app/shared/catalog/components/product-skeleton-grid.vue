<template>
  <!-- The design's loading card: the grid card's own plate with its blocks at the heights they hold. -->
  <div class="product-skeleton-grid" aria-hidden="true">
    <div class="product-skeleton-grid__block aspect-square w-full rounded-[0.625rem]"></div>

    <div class="product-skeleton-grid__block mt-3 h-3.5 w-[90%]"></div>

    <div class="product-skeleton-grid__block mt-1.5 h-3.5 w-[70%]"></div>

    <div class="product-skeleton-grid__block mt-3 h-2.5 w-1/2"></div>

    <div class="product-skeleton-grid__block mt-1.5 h-2.5 w-3/5"></div>

    <div class="product-skeleton-grid__block mt-3.5 h-5 w-2/5"></div>

    <div class="product-skeleton-grid__block mt-3 h-[2.375rem] w-full rounded-full"></div>
  </div>
</template>

<style lang="scss">
.product-skeleton-grid {
  @apply flex w-full flex-col rounded-xl border border-neutral-200 bg-additional-50 px-2 pb-4 pt-2;

  &__block {
    @apply relative overflow-hidden rounded bg-neutral-100;

    // A light passing over the block, as the design's loading state has it; still where motion is
    // not wanted.
    &::after {
      @apply absolute inset-0 motion-safe:animate-[product-skeleton-shimmer_1.2s_infinite];

      content: "";
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.6), transparent);
    }
  }
}

@keyframes product-skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
