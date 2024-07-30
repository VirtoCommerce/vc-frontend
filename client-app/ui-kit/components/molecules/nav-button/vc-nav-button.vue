<template>
  <button
    type="button"
    :aria-label="label"
    :disabled="disabled"
    :class="[
      'vc-nav-button',
      `vc-nav-button--size--${size}`,
      {
        'vc-nav-button--disabled': disabled,
      },
    ]"
    @click="$emit('click', $event)"
  >
    <VcIcon :name="`chevron-${direction}`" />
  </button>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "click", value: MouseEvent): void;
}

interface IProps {
  size?: "xs" | "sm" | "md";
  direction?: "left" | "right" | "up" | "down";
  disabled?: boolean;
  label?: string;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  size: "md",
  direction: "right",
  disabled: false,
});
</script>

<style lang="scss">
.vc-nav-button {
  @apply flex-none flex items-center justify-center rounded-full shadow-xl bg-additional-50 text-primary;

  &--size {
    &--xs {
      --vc-icon-size: 0.875rem;

      @apply w-7 h-7;
    }

    &--sm {
      --vc-icon-size: 1rem;

      @apply w-9 h-9;
    }

    &--md {
      --vc-icon-size: 1.5rem;

      @apply w-14 h-14;
    }
  }

  &:hover {
    @apply text-primary-700;
  }

  &:disabled,
  &--disabled {
    @apply text-neutral-300;
  }
}
</style>
