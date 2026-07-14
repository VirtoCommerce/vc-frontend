<template>
  <div class="product-property">
    <div class="product-property__label-group">
      <div class="product-property__label">
        {{ label }}
      </div>

      <div class="product-property__separator"></div>
    </div>

    <div class="product-property__value">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.product-property {
  @apply flex gap-x-3;

  &__label-group {
    @apply flex w-1/2 gap-x-3;
  }

  &__label {
    @apply shrink text-neutral;
  }

  &__separator {
    @apply h-5 flex-1 border-b border-dotted;
  }

  &__value {
    @apply line-clamp-3 w-1/2 font-bold;
  }
}
</style>
