<template>
  <VcWidget :class="['coupon-item-skeleton', { 'coupon-item-skeleton--compact': compact }]">
    <template #default-container>
      <div class="coupon-item-skeleton__wrapper">
        <div class="coupon-item-skeleton__title">
          <div class="coupon-item-skeleton__line">&nbsp;</div>
        </div>

        <div class="coupon-item-skeleton__name">
          <div class="coupon-item-skeleton__line">&nbsp;</div>
        </div>

        <div class="coupon-item-skeleton__description">
          <div class="coupon-item-skeleton__line">&nbsp;</div>

          <div v-if="compact" class="coupon-item-skeleton__line">&nbsp;</div>
        </div>

        <div class="coupon-item-skeleton__end-date">
          <div class="coupon-item-skeleton__line">&nbsp;</div>
        </div>

        <div class="coupon-item-skeleton__code">
          <div class="coupon-item-skeleton__line">&nbsp;</div>
        </div>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
interface IProps {
  /** Matches CouponItem's compact layout, so the placeholder has the shape of the card that replaces it. */
  compact?: boolean;
}

withDefaults(defineProps<IProps>(), { compact: false });
</script>

<style lang="scss">
.coupon-item-skeleton {
  $compact: "";

  // Compact: the same placement as CouponItem's compact layout (see coupon-item.vue), switched on the card's own width.
  &--compact {
    $compact: &;

    container-type: inline-size;
  }

  &__wrapper {
    @apply p-4 grid grid-cols-3 gap-4 animate-pulse;

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-12 gap-5;
    }

    #{$compact} & {
      @apply flex flex-col gap-y-1;

      @container (min-width: theme("containers.2xl")) {
        @apply grid grid-cols-12 gap-x-5 gap-y-1;
      }
    }
  }

  // In compact, lines take the real card's line boxes (and the code its button), so the card replacing it doesn't jump.
  &__title {
    @apply order-1 col-span-1 flex items-center justify-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }

    #{$compact} & {
      @apply order-none justify-start;

      --height: theme("lineHeight.7");

      @container (min-width: theme("containers.2xl")) {
        @apply col-span-2 col-start-1 row-span-3 row-start-1 justify-center;
      }
    }
  }

  &__name {
    @apply order-2 col-span-2 flex items-center border-l border-neutral-300 pl-4;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 border-l-0 pl-0;
    }

    #{$compact} & {
      @apply order-none border-l-0 pl-0;

      --height: theme("lineHeight.6");

      @container (min-width: theme("containers.2xl")) {
        @apply col-span-7 col-start-3 row-start-1;
      }
    }
  }

  &__description {
    @apply order-3 col-span-3 hidden items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 flex;
    }

    #{$compact} & {
      @apply order-none flex flex-col gap-y-1;

      --height: theme("lineHeight.5");

      @container (min-width: theme("containers.2xl")) {
        @apply col-span-7 col-start-3 row-start-2;
      }
    }
  }

  &__end-date {
    @apply order-last col-span-3 flex items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2 mt-0 flex-col;
    }

    #{$compact} & {
      @apply order-none flex-row;

      @container (min-width: theme("containers.2xl")) {
        @apply col-span-7 col-start-3 row-start-3;
      }
    }
  }

  &__code {
    @apply order-4 col-span-3 flex items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }

    // Code button: py-3, a leading-5 code, a text-xs label and a 1px border on each side.
    #{$compact} & {
      @apply order-none mt-2;

      --height: calc(theme("spacing.6") + theme("lineHeight.5") + theme("lineHeight.4") + 2px);

      @container (min-width: theme("containers.2xl")) {
        @apply col-span-3 col-start-10 row-span-3 row-start-1 mt-0;
      }
    }
  }

  &__line {
    @apply rounded h-[var(--height,1rem)] bg-neutral-100 w-full;
  }
}
</style>
