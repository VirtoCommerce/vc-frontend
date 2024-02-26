<template>
  <div
    :class="[
      'vc-product-price',
      `vc-product-price--align--${align}`,
      {
        'vc-product-price--single-line': singleLine,
        'vc-product-price--truncate': truncate,
      },
    ]"
  >
    <span class="vc-product-price__actual">
      <span v-if="hasVariations" class="vc-product-price__variations"> {{ $t("common.suffixes.from") }}</span>

      <VcPriceDisplay :value="listPrice?.amount > actualPrice?.amount || !listPrice ? actualPrice : listPrice" />
    </span>

    <VcPriceDisplay
      v-if="!hasVariations && listPrice?.amount > actualPrice?.amount"
      class="vc-product-price__list"
      :value="listPrice"
    />
  </div>
</template>

<script setup lang="ts">
import type { MoneyType } from "@/core/api/graphql/types";

interface IProps {
  actualPrice?: MoneyType;
  listPrice?: MoneyType;
  align?: "start" | "end";
  singleLine?: boolean;
  truncate?: boolean;
  hasVariations?: boolean;
}

withDefaults(defineProps<IProps>(), {
  align: "start",
});
</script>

<style lang="scss">
.vc-product-price {
  $truncate: "";

  --font-size: var(--vc-product-price-font-size);

  @apply flex flex-col text-[length:var(--font-size)] text-[--color-neutral-950] [word-break:break-word] leading-[1.2];

  &--align {
    &--start {
      @apply items-start text-start;
    }

    &--end {
      @apply items-end text-end;
    }
  }

  &--single-line {
    @apply flex-row flex-wrap items-center gap-x-1;
  }

  &--truncate {
    $truncate: &;
  }

  &__actual {
    @apply font-bold text-[--color-neutral-950];

    #{$truncate} & {
      @apply whitespace-nowrap max-w-full truncate;
    }
  }

  &__variations {
    @apply me-1 whitespace-nowrap text-xs font-normal text-[--color-neutral-500];
  }

  &__list {
    @apply text-[0.7em] line-through text-[--color-neutral-500];

    #{$truncate} & {
      @apply max-w-full truncate;
    }
  }
}
</style>
