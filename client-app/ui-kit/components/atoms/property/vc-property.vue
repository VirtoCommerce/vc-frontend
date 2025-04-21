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
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label: string;
  value?: string | number | boolean | null | undefined;
  disabled?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-property {
  --font-size: var(--vc-property-font-size, 0.75rem);
  --label-color: var(--vc-property-label-color, var(--color-neutral-700));
  --value-color: var(--vc-property-value-color, var(--color-neutral-950));

  &--disabled {
    --label-color: var(--color-neutral-500);
    --value-color: var(--color-neutral-500);
  }

  @apply grid grid-cols-[auto_1fr_auto] gap-1 items-end text-[length:var(--font-size)] leading-[1.5];

  &__label {
    @apply min-w-0 truncate text-[--label-color];
  }

  &__dots {
    @apply mb-[3px] border-b border-dotted border-neutral-200;
  }

  &__value {
    @apply min-w-0 font-bold text-[--value-color] truncate;
  }
}
</style>
