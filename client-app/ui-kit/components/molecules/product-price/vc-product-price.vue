<template>
  <div
    :class="[
      'vc-product-price',
      {
        'vc-product-price--align--start': align === 'start',
        'vc-product-price--align--end': align === 'end',
        'vc-product-price--single-line': singleLine,
        'vc-product-price--truncate': truncate,
        'vc-product-price--disabled': disabled,
      },
    ]"
  >
    <span class="vc-product-price__actual">
      <span v-if="withFromLabel" class="vc-product-price__variations">
        {{ $t("ui_kit.suffixes.from") }}
      </span>

      <VcPriceDisplay :value="shouldUseActualPrice(listPrice, actualPrice) || !listPrice ? actualPrice : listPrice" />
    </span>

    <VcPriceDisplay
      v-if="!withFromLabel && shouldUseActualPrice(listPrice, actualPrice)"
      class="vc-product-price__list"
      :value="listPrice"
    />
  </div>
</template>

<script setup lang="ts">
import { shouldUseActualPrice } from "@/ui-kit/utilities/price";
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  actualPrice?: MoneyType;
  listPrice?: MoneyType;
  align?: "start" | "end";
  singleLine?: boolean;
  truncate?: boolean;
  disabled?: boolean;
  withFromLabel?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-product-price {
  $self: &;
  $truncate: "";
  $singleLine: "";

  --font-size: var(--vc-product-price-font-size);

  @apply flex flex-col text-[length:var(--font-size)] text-neutral-950 [word-break:break-word] leading-[1.335];

  &--align {
    &--start {
      @apply justify-start text-start;
    }

    &--end {
      @apply justify-end text-end;
    }
  }

  &--single-line {
    $singleLine: &;

    @apply flex-row flex-wrap items-center gap-x-1;
  }

  &--truncate {
    $truncate: &;
  }

  &--disabled {
    @apply text-neutral;
  }

  &__actual {
    @apply font-bold;

    #{$truncate} & {
      @apply whitespace-nowrap max-w-full truncate;
    }
  }

  &__variations {
    @apply block me-1 whitespace-nowrap text-xs font-normal text-neutral;

    #{$singleLine} & {
      @apply inline-block;
    }
  }

  &__list {
    @apply text-[0.7em] line-through text-neutral;

    #{$truncate} & {
      @apply max-w-full truncate;
    }
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: price;
    }

    &--view-mode {
      &--grid #{$self} {
        --font-size: theme("fontSize.lg");

        @apply mt-3;

        @container (min-width: theme("containers.xxs")) {
          --font-size: theme("fontSize.2xl");

          @apply mt-4;
        }
      }

      &--list #{$self} {
        --font-size: theme("fontSize.lg");

        @container (max-width: theme("containers.xl")) {
          @apply self-start mt-1 flex-row items-center gap-x-1.5 flex-wrap;
        }

        @container (min-width: theme("containers.xl")) {
          --font-size: theme("fontSize.sm");

          @apply ms-3 w-[7.5rem] justify-end;
        }

        @container (min-width: theme("containers.4xl")) {
          --font-size: theme("fontSize.lg");

          @apply w-[9.5rem];
        }
      }

      &--item {
        #{$self} {
          @apply hidden;

          @container (min-width: theme("containers.4xl")) {
            --font-size: theme("fontSize.sm");

            @apply flex flex-col justify-end w-[6.75rem] text-end;
          }
        }

        .vc-product-total #{$self} {
          --font-size: theme("fontSize.base");

          @apply flex;
        }
      }
    }
  }
}
</style>
