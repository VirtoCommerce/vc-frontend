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

      <div class="coupon-item-skeleton__line">&nbsp;</div>
    </div>

    <div class="coupon-item-skeleton__end-date">
      <div class="coupon-item-skeleton__line">&nbsp;</div>

      <div class="coupon-item-skeleton__line">&nbsp;</div>
    </div>

    <div class="coupon-item-skeleton__code">
      <div class="coupon-item-skeleton__code-inner">
        <div class="coupon-item-skeleton__line">&nbsp;</div>

        <div class="coupon-item-skeleton__line">&nbsp;</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.coupon-item-skeleton {
  @apply bg-additional-50 rounded-md shadow-md p-4 grid grid-cols-3 lg:grid-cols-12 gap-4 lg:gap-5 animate-pulse;

  &__title {
    @apply order-1 col-span-1 lg:order-none lg:col-span-2 flex items-center justify-center;

    .coupon-item-skeleton__line {
      @apply w-3/4;
    }
  }

  &__name {
    @apply order-2 col-span-2 lg:order-none lg:col-span-3 flex items-center border-l border-neutral-300 pl-4 lg:border-l-0 lg:pl-0;

    .coupon-item-skeleton__line {
      @apply w-2/3;
    }
  }

  &__description {
    @apply order-3 col-span-3 lg:col-span-3 2xl:col-span-4 lg:order-none hidden lg:flex flex-col justify-center;

    .coupon-item-skeleton__line {
      @apply w-4/5;

      &:first-child {
        @apply w-full mb-1;
      }
    }
  }

  &__end-date {
    @apply order-last col-span-3 lg:col-span-2 2xl:col-span-1 lg:order-none -mt-2.5 lg:mt-0 flex items-center justify-center text-center lg:flex-col gap-1;

    .coupon-item-skeleton__line {
      @apply w-10;

      &:last-child {
        @apply w-14;
      }
    }
  }

  &__code {
    @apply order-4 col-span-3 lg:order-none lg:col-span-2 flex items-center;

    &-inner {
      @apply w-full border border-dashed border-neutral-200 items-center px-2.5 py-3 rounded flex flex-col;

      .coupon-item-skeleton__line {
        @apply w-3/4;

        &:last-child {
          @apply w-1/2 mt-1;
        }
      }
    }
  }

  &__line {
    @apply rounded h-4 bg-neutral-100;
  }
}
</style>
