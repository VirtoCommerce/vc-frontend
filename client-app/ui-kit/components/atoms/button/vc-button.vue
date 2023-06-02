<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="enabled ? route : ''"
    :type="isLink ? null : submit ? 'submit' : 'button'"
    :disabled="!enabled"
    :title="title"
    :class="[
      'vc-button',
      `vc-button--size--${size}`,
      `vc-button--${variant}--${color}`,
      {
        'vc-button--icon': !!icon,
        'vc-button--disabled': !enabled,
        'vc-button--loading': loading,
        'vc-button--truncate': truncate,
      },
    ]"
    @click="enabled ? $emit('click', $event) : null"
  >
    <VcIcon v-if="icon" class="vc-button__icon" :name="icon" :size="iconSize" />

    <span v-else class="vc-button__content">
      <span v-if="$slots.prepend || prependIcon" class="vc-button__prepend">
        <slot name="prepend">
          <VcIcon v-if="prependIcon" class="vc-button__icon" :name="prependIcon" :size="iconSize" />
        </slot>
      </span>

      <span v-if="$slots.default" class="vc-button__slot">
        <slot />
      </span>

      <span v-if="$slots.append || appendIcon" class="vc-button__append">
        <slot name="append">
          <VcIcon v-if="appendIcon" class="vc-button__icon" :name="appendIcon" :size="iconSize" />
        </slot>
      </span>
    </span>

    <span class="vc-button__loader"></span>
  </component>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import type { RouteLocationRaw } from "vue-router";

export interface IEmits {
  (event: "click", value: MouseEvent): void;
}

interface IProps {
  color?: "primary" | "secondary" | "success" | "info" | "neutral" | "warning" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "solid" | "outline";
  submit?: boolean;
  disabled?: boolean;
  loading?: boolean;
  route?: RouteLocationRaw | null;
  prependIcon?: string;
  appendIcon?: string;
  icon?: string;
  title?: string;
  truncate?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "primary",
  size: "md",
  variant: "solid",
  submit: false,
  disabled: false,
  loading: false,
  route: null,
});

const enabled = eagerComputed<boolean>(() => !props.disabled && !props.loading);
const isLink = eagerComputed<boolean>(() => !!props.route && enabled.value);

const iconSize = eagerComputed(() => {
  switch (props.size) {
    case "xs":
      return 14;
    case "sm":
      return 16;
    case "md":
      return 20;
    case "lg":
      return 24;
  }
});
</script>

<style scoped lang="scss">
.vc-button {
  $colors: primary, secondary, success, info, neutral, warning, danger;

  $prepend: "";
  $append: "";
  $icon: "";
  $truncate: "";
  $disabled: "";
  $loading: "";
  $loader: "";

  @apply relative inline-flex justify-center rounded border-2 select-none text-center;

  &--truncate {
    $truncate: &;
  }

  &--disabled {
    $disabled: &;
  }

  &--loading {
    $loading: &;
  }

  &--icon {
    $icon: &;
  }

  &__loader {
    $loader: &;

    @apply hidden;

    #{$loading} & {
      @apply absolute inset-0 flex justify-center items-center;

      &:before {
        @apply content-[''] rounded-full border-[--color-neutral-300] border-r-[--color-neutral-500] animate-spin;
      }
    }
  }

  &--size {
    &--xs {
      @apply px-2.5 py-1.5 text-xs/[0.875rem] font-bold;

      &#{$icon} {
        @apply px-1.5;
      }

      & #{$loader} {
        &:before {
          @apply border-2 w-3.5 h-3.5;
        }
      }
    }

    &--sm {
      @apply px-3 py-2 text-xs uppercase font-black;

      &#{$icon} {
        @apply px-2;
      }

      & #{$loader} {
        &:before {
          @apply border-2 w-4 h-4;
        }
      }
    }

    &--md {
      @apply px-5 py-2.5 text-sm uppercase font-black;

      &#{$icon} {
        @apply px-2.5;
      }

      & #{$loader} {
        &:before {
          @apply border-[3px] w-5 h-5;
        }
      }
    }

    &--lg {
      @apply px-7 py-3.5 text-base uppercase font-black;

      &#{$icon} {
        @apply px-3.5;
      }

      & #{$loader} {
        &:before {
          @apply border-[3px] w-6 h-6;
        }
      }
    }
  }

  @each $color in $colors {
    &--solid--#{$color} {
      @apply bg-[--color-#{$color}-500]
      border-[--color-#{$color}-500]
      text-[--color-additional-50];

      &:hover {
        @apply bg-[--color-#{$color}-700]
        border-[--color-#{$color}-700];
      }

      &:focus {
        @apply outline-[--color-#{$color}-100];
      }
    }

    &--outline--#{$color} {
      @apply text-[--color-#{$color}-500] border-current;

      &:hover {
        @apply text-[--color-#{$color}-700];
      }

      &:focus {
        @apply outline-[--color-#{$color}-100];
      }
    }
  }

  &:disabled,
  #{$disabled} {
    &[class*="--solid--"] {
      @apply bg-[--color-neutral-50] border-[--color-neutral-50] text-[--color-neutral-300];
    }

    &[class*="--outline--"] {
      @apply text-[--color-neutral-300];
    }
  }

  &__content {
    @apply flex min-w-0;

    #{$loading} & {
      @apply invisible;
    }
  }

  &__slot {
    #{$truncate} & {
      @apply truncate;
    }
  }

  &__prepend {
    $prepend: &;
  }

  &__append {
    $append: &;
  }

  &__icon {
    #{$prepend} & {
      @apply me-2;
    }

    #{$append} & {
      @apply ms-2;
    }
  }

  &:focus {
    @apply outline outline-[3px];
  }
}
</style>
