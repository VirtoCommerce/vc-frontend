<template>
  <div
    :class="[
      'vc-product-price',
      `vc-product-price--align--${align}`,
      {
        'vc-product-price--single-line': singleLine,
        'vc-product-price--truncate': truncate,
        'vc-product-price--disabled': disabled,
      },
    ]"
  >
    <span class="vc-product-price__actual">
      <span v-if="hasVariations" class="vc-product-price__variations"> {{ $t("common.suffixes.from") }}</span>

      <VcPriceDisplay :value="shouldUseActualPrice || !listPrice ? actualPrice : listPrice" />
    </span>

    <VcPriceDisplay v-if="!hasVariations && shouldUseActualPrice" class="vc-product-price__list" :value="listPrice" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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

const props = withDefaults(defineProps<IProps>(), {
  align: "start",
});

const shouldUseActualPrice = computed(() => {
  return props.listPrice && props.actualPrice && props.listPrice.amount > props.actualPrice.amount;
});
</script>

<style lang="scss">
.vc-product-price {
  $truncate: "";

  --font-size: var(--vc-product-price-font-size);

  @apply flex flex-col text-[length:var(--font-size)] text-neutral-950 [word-break:break-word] leading-[1.2];

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
