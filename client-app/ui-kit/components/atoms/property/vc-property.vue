<template>
  <div
    :class="[
      'vc-property',
      {
        'vc-property--disabled': disabled,
      },
    ]"
  >
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
  disabled?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-property {
  $disabled: "";

  --label-color: var(--color-neutral-600);
  --value-color: var(--color-neutral-900);

  @apply grid grid-cols-[auto_1fr_auto] gap-1 font-lato text-xs;

  &--disabled {
    --label-color: var(--color-neutral-500);
    --value-color: var(--color-neutral-500);
  }

  &__label {
    @apply min-w-0 truncate text-[--label-color];
  }

  &__dots {
    @apply mb-[3px] h-3 border-b border-dotted border-[--color-neutral-200];
  }

  &__value {
    @apply min-w-0 font-bold text-[--value-color] truncate;
  }
}
</style>
