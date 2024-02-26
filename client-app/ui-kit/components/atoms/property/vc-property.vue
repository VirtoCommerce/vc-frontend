<template>
  <div class="vc-property">
    <div class="vc-property__label">{{ label }}</div>
    <div class="vc-property__dots"></div>
    <div class="vc-property__value">
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
.vc-property {
  --label-color: var(--vc-property-label-color, var(--color-neutral-600));
  --value-color: var(--vc-property-value-color, var(--color-neutral-900));

  @apply grid grid-cols-[auto_1fr_auto] gap-1 text-xs leading-normal;

  &__label {
    @apply min-w-0 truncate text-[--label-color];
  }

  &__dots {
    @apply mb-[3px] border-b border-dotted border-[--color-neutral-200];
  }

  &__value {
    @apply min-w-0 font-bold text-[--value-color] truncate;
  }
}
</style>
