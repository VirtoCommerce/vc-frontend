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
    <VcPriceDisplay
      class="vc-product-price__actual"
      :value="listPrice?.amount > actualPrice?.amount ? actualPrice : listPrice"
    />
    <VcPriceDisplay v-if="listPrice?.amount > actualPrice?.amount" class="vc-product-price__list" :value="listPrice" />
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
}

withDefaults(defineProps<IProps>(), {
  align: "start",
});
</script>

<style lang="scss">
.vc-product-price {
  $truncate: "";

  --font-size: --vc-product-price-font-size;

  @apply flex flex-col text-[length:var(--font-size)] font-bold text-[--color-neutral-950] [word-break:break-word];

  @apply leading-[1.2] #{!important};

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
    @apply text-[--color-neutral-950];

    #{$truncate} & {
      @apply max-w-full truncate;
    }
  }

  &__list {
    @apply text-[0.7em] line-through text-[--color-neutral-500];

    #{$truncate} & {
      @apply max-w-full truncate;
    }
  }
}
</style>
