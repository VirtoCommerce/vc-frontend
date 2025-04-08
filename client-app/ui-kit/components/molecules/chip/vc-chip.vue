<template>
  <component
    :is="clickable ? 'button' : 'span'"
    :disabled="disabled"
    :draggable="draggable && !disabled"
    :class="[
      'vc-chip',
      `vc-chip--size--${size}`,
      `vc-chip--color--${color}`,
      `vc-chip--${variant}--${color}`,
      {
        'vc-chip--disabled': disabled,
        'vc-chip--clickable': clickable,
        'vc-chip--closable': closable,
        'vc-chip--rounded': rounded,
        'vc-chip--truncate': truncate,
        'vc-chip--nowrap': nowrap,
      },
    ]"
  >
    <span class="vc-chip__content">
      <VcIcon v-if="icon" :color="_iconColor" :name="icon" class="vc-chip__icon" />

      <slot />
    </span>

    <button
      v-if="closable"
      :disabled="disabled"
      type="button"
      class="vc-chip__close-button"
      @click.stop="disabled ? null : $emit('close')"
    >
      <slot name="close-icon">
        <VcIcon name="delete-2" />
      </slot>
    </button>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IEmits {
  (event: "close"): void;
}

interface IProps {
  color?: VcChipColorType;
  variant?: VcChipVariantType;
  size?: "xs" | "sm" | "md" | "lg";
  clickable?: boolean;
  closable?: boolean;
  disabled?: boolean;
  draggable?: boolean;
  rounded?: boolean;
  truncate?: boolean;
  nowrap?: boolean;
  icon?: string;
  iconColor?: string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "primary",
  variant: "solid",
  size: "md",
  nowrap: true,
});

const _iconColor = computed(() =>
  props.variant === "solid" ? "--color-additional-50" : (props.iconColor ?? props.color),
);
</script>

<style lang="scss">
.vc-chip {
  $colors: primary, secondary, success, info, warning, danger, neutral;

  $truncate: "";
  $clickable: "";

  @apply inline-flex justify-between max-w-full rounded-sm border font-bold text-center px-[--padding-x] py-[--padding-y];

  &--clickable {
    $clickable: &;
  }

  &--truncate {
    $truncate: &;
  }

  &--nowrap:not(#{$truncate}) {
    @apply w-auto whitespace-nowrap #{!important};
  }

  &--rounded {
    @apply rounded-full;
  }

  &--size {
    &--xs {
      --vc-icon-size: 0.5rem;
      --padding-y: 0;
      --padding-x: 0.25rem;

      @apply gap-1 text-[0.625rem]/[0.875rem];
    }

    &--sm {
      --vc-icon-size: 0.625rem;
      --padding-y: 0.125rem;
      --padding-x: 0.375rem;

      @apply gap-1 text-xs/[1rem];
    }

    &--md {
      --vc-icon-size: 0.75rem;
      --padding-y: 0.25rem;
      --padding-x: 0.5rem;

      @apply gap-1.5 text-sm/[1.125rem];
    }

    &--lg {
      --vc-icon-size: 0.875rem;
      --padding-y: 0.375rem;
      --padding-x: 0.625rem;

      @apply gap-1.5 text-sm/[1.25rem];
    }
  }

  @each $color in $colors {
    &--solid--#{$color} {
      @apply bg-[--color-#{$color}-500] border-[--color-#{$color}-500] text-additional-50;

      &#{$clickable} {
        &:hover {
          @apply bg-[--color-#{$color}-700] border-[--color-#{$color}-700];
        }
      }
    }

    &--solid-light--#{$color} {
      @apply bg-[--color-#{$color}-50] border-[--color-#{$color}-50] text-[--color-#{$color}-800];

      &#{$clickable} {
        &:hover {
          @apply bg-[--color-#{$color}-100];
        }
      }
    }

    &--outline--#{$color} {
      @apply bg-additional-50 text-[--color-#{$color}-800] border-[--color-#{$color}-500];

      &#{$clickable} {
        &:hover {
          @apply bg-[--color-#{$color}-50];
        }
      }
    }

    &--outline-dark--#{$color} {
      @apply bg-[--color-#{$color}-50] text-[--color-#{$color}-800] border-[--color-#{$color}-500];

      &#{$clickable} {
        &:hover {
          @apply bg-[--color-#{$color}-100];
        }
      }
    }

    &--color--#{$color} {
      &#{$clickable} {
        &:focus {
          @apply ring-[3px] ring-[--color-#{$color}-100];
        }
      }
    }
  }

  &__content {
    @apply grow inline-flex items-center gap-[inherit] max-w-full;

    #{$truncate} &,
    #{$truncate} & > * {
      @apply truncate;
    }
  }

  &__close-button {
    @apply self-stretch flex items-center ps-1 pe-[--padding-x] -ms-1 -me-[--padding-x] py-[--padding-y] -my-[--padding-y] rounded-r-[inherit];
  }

  .vc-icon {
    @apply flex-none;
  }

  &:disabled,
  &--disabled {
    &[class*="--solid-"] {
      @apply bg-neutral-100 border-neutral-100 text-neutral-400;
    }

    &[class*="--outline-"] {
      @apply text-neutral-400 border-current;
    }
  }
}
</style>
