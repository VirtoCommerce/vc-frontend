<template>
  <component
    :is="isLink ? 'router-link' : 'button'"
    :to="enabled ? to : ''"
    :type="type"
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
        'vc-button--full-width': fullWidth,
        'vc-button--no-wrap': noWrap,
      },
    ]"
    @click="enabled ? $emit('click', $event) : null"
  >
    <span class="vc-button__content">
      <VcIcon v-if="icon && typeof icon === 'string'" class="vc-button__icon" :name="icon" />

      <template v-else>
        <span v-if="$slots.prepend || prependIcon" class="vc-button__prepend">
          <slot name="prepend">
            <VcIcon v-if="prependIcon" class="vc-button__icon" :name="prependIcon" />
          </slot>
        </span>

        <span v-if="$slots.default" class="vc-button__slot">
          <slot />
        </span>

        <span v-if="$slots.append || appendIcon" class="vc-button__append">
          <slot name="append">
            <VcIcon v-if="appendIcon" class="vc-button__icon" :name="appendIcon" />
          </slot>
        </span>
      </template>
    </span>

    <span v-if="loading" class="vc-button__loader">
      <slot name="loader">
        <span class="vc-button__loader-icon"></span>
      </slot>
    </span>
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
  type?: "button" | "reset" | "submit";
  disabled?: boolean;
  loading?: boolean;
  to?: RouteLocationRaw | null;
  prependIcon?: string;
  appendIcon?: string;
  icon?: boolean | string;
  title?: string;
  truncate?: boolean;
  fullWidth?: boolean;
  noWrap?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "primary",
  size: "md",
  variant: "solid",
  type: "button",
  disabled: false,
  loading: false,
  to: null,
  truncate: false,
  fullWidth: false,
  noWrap: false,
});

const enabled = eagerComputed<boolean>(() => !props.disabled && !props.loading);
const isLink = eagerComputed<boolean>(() => !!props.to && enabled.value);
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
  $loaderIcon: "";
  $noWrap: "";

  @apply relative inline-block rounded border-2 select-none text-center;

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

  &--full-width {
    @apply w-full;
  }

  &--no-wrap {
    $noWrap: &;
  }

  &__loader {
    @apply hidden;

    #{$loading} & {
      @apply absolute inset-0 flex justify-center items-center;
    }
  }

  &__loader-icon {
    $loaderIcon: &;

    @apply block rounded-full border-[--color-neutral-300] border-r-[--color-neutral-500] animate-spin;
  }

  &--size {
    &--xs {
      --vc-button-line-height: 0.875rem;

      @apply px-2.5 py-1.5 text-xs/[--vc-button-line-height] font-bold;

      &#{$icon} {
        @apply px-1.5;
      }

      & #{$loaderIcon} {
        @apply border-2 w-3.5 h-3.5;
      }
    }

    &--sm {
      --vc-button-line-height: 1rem;

      @apply px-3 py-2 text-xs/[--vc-button-line-height] uppercase font-black;

      &#{$icon} {
        @apply px-2;
      }

      & #{$loaderIcon} {
        @apply border-2 w-4 h-4;
      }
    }

    &--md {
      --vc-button-line-height: 1.25rem;

      @apply px-5 py-2.5 text-sm/[--vc-button-line-height] uppercase font-black;

      &#{$icon} {
        @apply px-2.5;
      }

      & #{$loaderIcon} {
        @apply border-[3px] w-5 h-5;
      }
    }

    &--lg {
      --vc-button-line-height: 1.75rem;

      @apply px-7 py-3.5 text-base/[--vc-button-line-height] uppercase font-black;

      &#{$icon} {
        @apply px-3.5;
      }

      & #{$loaderIcon} {
        @apply border-[3px] w-6 h-6;
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
      @apply bg-[--color-neutral-100] border-[--color-neutral-100] text-[--color-neutral-400];
    }

    &[class*="--outline--"] {
      @apply text-[--color-neutral-300];
    }
  }

  &__content {
    @apply grid grid-flow-col justify-center;

    #{$loading} & {
      @apply invisible;
    }
  }

  &__slot {
    word-break: break-word;

    #{$truncate} & {
      @apply grow min-w-0 truncate;
    }

    #{$noWrap} & {
      @apply whitespace-nowrap;
    }

    &:empty {
      @apply hidden;
    }
  }

  &__prepend {
    $prepend: &;

    &:empty {
      @apply hidden;
    }
  }

  &__append {
    $append: &;

    &:empty {
      @apply hidden;
    }
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
