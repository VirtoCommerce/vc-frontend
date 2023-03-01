<template>
  <div class="vc-property">
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
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-property {
  @apply grid grid-cols-[auto_1fr_auto] gap-1 font-lato text-xs text-gray-500;

  &__label {
    @apply min-w-0 truncate;
  }

  &__dots {
    @apply mb-1 border-b border-dashed border-gray-200;
  }

  &__value {
    @apply min-w-0 font-bold text-[color:var(--color-body-text)] truncate;
  }
}
</style>
