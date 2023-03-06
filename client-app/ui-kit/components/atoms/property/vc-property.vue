<template>
  <div
    :class="[
      'vc-property',
      {
        'vc-property--no-product': noProduct,
      },
    ]"
  >
    <div class="vc-property__label">{{ label }}</div>
    <div class="vc-property__dots"></div>
    <div class="vc-property__value">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label: string;
  value?: string;
  noProduct?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-property {
  $noProduct: "";

  @apply grid grid-cols-[auto_1fr_auto] gap-1 font-lato text-xs text-gray-500;

  &--no-product {
    $noProduct: &;
  }

  &__label {
    @apply min-w-0 truncate;

    #{$noProduct} & {
      @apply text-slate-400;
    }
  }

  &__dots {
    @apply mb-[3px] border-b border-dashed border-gray-200;
  }

  &__value {
    @apply min-w-0 font-bold text-[color:var(--color-body-text)] truncate;

    #{$noProduct} & {
      @apply text-slate-400;
    }
  }
}
</style>
