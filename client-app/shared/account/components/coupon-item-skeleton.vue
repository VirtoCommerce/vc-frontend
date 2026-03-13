<template>
  <VcWidget class="coupon-item-skeleton">
    <div class="coupon-item-skeleton__wrapper">
      <div class="coupon-item-skeleton__title">
        <div class="coupon-item-skeleton__line">&nbsp;</div>
      </div>

      <div class="coupon-item-skeleton__name">
        <div class="coupon-item-skeleton__line">&nbsp;</div>
      </div>

      <div class="coupon-item-skeleton__description">
        <div class="coupon-item-skeleton__line">&nbsp;</div>
      </div>

      <div class="coupon-item-skeleton__end-date">
        <div class="coupon-item-skeleton__line">&nbsp;</div>
      </div>

      <div class="coupon-item-skeleton__code">
        <div class="coupon-item-skeleton__line">&nbsp;</div>
      </div>
    </div>
  </VcWidget>
</template>

<style lang="scss">
.coupon-item-skeleton {
  &__wrapper {
    @apply grid grid-cols-3 gap-4 animate-pulse;

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-12 gap-5;
    }
  }

  &__title {
    @apply order-1 col-span-1 flex items-center justify-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }
  }

  &__name {
    @apply order-2 col-span-2 flex items-center border-l border-neutral-300 pl-4;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 border-l-0 pl-0;
    }
  }

  &__description {
    @apply order-3 col-span-3 hidden items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 flex;
    }
  }

  &__end-date {
    @apply order-last col-span-3 flex items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2 mt-0 flex-col;
    }
  }

  &__code {
    @apply order-4 col-span-3 flex items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }
  }

  &__line {
    @apply rounded h-4 bg-neutral-100 w-full;
  }
}
</style>
