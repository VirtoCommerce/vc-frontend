<template>
  <div class="coupon-item-skeleton">
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

      <div class="coupon-item-skeleton__line">&nbsp;</div>
    </div>

    <div class="coupon-item-skeleton__code">
      <div class="coupon-item-skeleton__line">&nbsp;</div>
    </div>
  </div>
</template>

<style lang="scss">
.coupon-item-skeleton {
  @apply bg-additional-50 rounded-md shadow-md p-4 grid grid-cols-3 gap-4 animate-pulse;

  @media (min-width: theme("screens.lg")) {
    @apply grid-cols-12 gap-5;
  }

  &__title {
    @apply order-1 col-span-1 flex items-center justify-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }

    .coupon-item-skeleton__line {
      @apply w-3/4;
    }
  }

  &__name {
    @apply order-2 col-span-2 flex items-center border-l border-neutral-300 pl-4;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 border-l-0 pl-0;
    }

    .coupon-item-skeleton__line {
      @apply w-2/3;
    }
  }

  &__description {
    @apply order-3 col-span-3 hidden items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 flex;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply col-span-4;
    }

    .coupon-item-skeleton__line {
      @apply w-full;
    }
  }

  &__end-date {
    @apply order-last col-span-3 -mt-2.5 flex items-center justify-center text-center gap-1;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2 mt-0 flex-col;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply col-span-1;
    }

    .coupon-item-skeleton__line {
      @apply w-10;

      &:last-child {
        @apply w-14;
      }
    }
  }

  &__code {
    @apply order-4 col-span-3 flex items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }

    .coupon-item-skeleton__line {
      @apply w-full;
    }
  }

  &__line {
    @apply rounded h-4 bg-neutral-100;
  }
}
</style>
