<template>
  <div
    :class="[
      'vc-switch',
      `vc-switch--color--${color}`,
      `vc-switch--size--${size}`,
      {
        'vc-switch--on': modelValue,
        'vc-switch--disabled': disabled,
      },
    ]"
    :click="toggle"
  >
    <div class="vc-switch--circle"></div>
  </div>
</template>

<script setup lang="ts">
export interface IEmits {
  (event: "click", value: MouseEvent): void;
  (event: "update:modelValue", value?: boolean): void;
}

interface IProps {
  modelValue?: boolean;
  disabled?: boolean;
  color?: VcSwitchColorType;
  size?: "xs" | "sm" | "md" | "lg";
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  size: "md",
  color: "primary",
});

function toggle() {
  emit("update:modelValue", !props.modelValue);
}
</script>

<style lang="scss">
.vc-switch {
  $colors: primary, secondary, success, info, neutral, warning, danger, accent;

  $on: "";
  $disabled: "";

  --color: var(--color-neutral-300);
  --circle-color: var(--color-additional-50);

  @apply relative p-0.5 h-[--circle-size] box-content rounded-full bg-current border border-current text-[--color] cursor-pointer;

  &--size {
    &--xs {
      --circle-size: 0.625rem;

      @apply w-5;
    }

    &--sm {
      --circle-size: 0.75rem;

      @apply w-6;
    }

    &--md {
      --circle-size: 1rem;

      @apply w-[1.875rem];
    }

    &--lg {
      --circle-size: 1.25rem;

      @apply w-[2.375rem];
    }
  }

  &--on {
    $on: &;
  }

  &--disabled {
    $disabled: &;

    --circle-color: var(--color-neutral-50);
    --color: var(--color-neutral-200);

    @apply cursor-not-allowed;
  }

  @each $color in $colors {
    &--color {
      &--#{$color}#{$on} {
        --color: var(--color-#{$color}-500);

        &#{$disabled} {
          --color: var(--color-#{$color}-300);
        }
      }
    }
  }

  &--circle {
    @apply relative left-0 size-[--circle-size] bg-[--circle-color] rounded-full transition-[left];

    #{$on} & {
      @apply left-[calc(100%-var(--circle-size))];
    }
  }
}
</style>
