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
      <span v-if="hasVariations" class="vc-product-price__variations"> {{ $t("common.suffixes.from") }}</span>

      <VcPriceDisplay :value="shouldUseActualPrice(listPrice, actualPrice) || !listPrice ? actualPrice : listPrice" />
    </span>

    <VcPriceDisplay
      v-if="!hasVariations && shouldUseActualPrice(listPrice, actualPrice)"
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
  hasVariations?: boolean;
  disabled?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-product-price {
  $truncate: "";

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
    @apply me-1 whitespace-nowrap text-xs font-normal text-neutral;
  }

  &__list {
    @apply text-[0.7em] line-through text-neutral;

    #{$truncate} & {
      @apply max-w-full truncate;
    }
  }
}
</style>
