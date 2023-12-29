<template>
  <component
    :is="componentTag"
    v-bind="linkAttr"
    :target="target"
    :type="type"
    :disabled="!enabled"
    :title="title"
    :class="[
      'vc-button',
      `vc-button--size--${size}`,
      `vc-button--color--${color}`,
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
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

export interface IEmits {
  (event: "click", value: MouseEvent): void;
}

interface IProps {
  color?: "primary" | "secondary" | "success" | "info" | "neutral" | "warning" | "danger" | "accent";
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "solid-lightest" | "no-background";
  type?: "button" | "reset" | "submit";
  disabled?: boolean;
  loading?: boolean;
  to?: RouteLocationRaw | null;
  externalLink?: string;
  target?: "_self" | "_blank";
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
const isRouterLink = eagerComputed<boolean>(() => !!props.to && enabled.value);
const isExternalLink = eagerComputed<boolean>(() => !!props.externalLink && enabled.value);

const target = computed<string | undefined>(() =>
  props.target && (isExternalLink.value || isRouterLink.value) ? props.target : undefined,
);

const componentTag = computed(() => {
  if (isRouterLink.value) {
    return "router-link";
  }
  if (isExternalLink.value) {
    return "a";
  }
  return "button";
});

const linkAttr = computed(() => {
  if (componentTag.value === "router-link") {
    return { to: props.to };
  }
  if (componentTag.value === "a") {
    return { href: props.externalLink };
  }
  return {};
});
</script>

<style scoped lang="scss">
.vc-button {
  $colors: primary, secondary, success, info, neutral, warning, danger, accent;

  $prepend: "";
  $append: "";
  $icon: "";
  $truncate: "";
  $disabled: "";
  $loading: "";
  $loaderIcon: "";
  $noWrap: "";

  @apply relative inline-block rounded border-2 select-none text-center;

  --vc-icon-size: var(--vc-button-line-height);

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

    @apply block rounded-full animate-spin;
  }

  &--size {
    &--xs {
      --vc-button-line-height: 0.875rem;

      @apply px-2.5 py-1 text-xs/[--vc-button-line-height] font-bold;

      &#{$icon} {
        @apply px-1;
      }

      & #{$loaderIcon} {
        @apply border-2 w-3.5 h-3.5;
      }
    }

    &--sm {
      --vc-button-line-height: 1rem;

      @apply p-2 text-xs/[--vc-button-line-height] uppercase font-black;

      & #{$loaderIcon} {
        @apply border-2 w-4 h-4;
      }
    }

    &--md {
      --vc-button-line-height: 1.25rem;

      @apply p-2.5 text-sm/[--vc-button-line-height] uppercase font-black;

      & #{$loaderIcon} {
        @apply border-[3px] w-5 h-5;
      }
    }

    &--lg {
      --vc-button-line-height: 1.5rem;

      @apply p-3.5 text-base/[--vc-button-line-height] uppercase font-black;

      & #{$loaderIcon} {
        @apply border-[3px] w-6 h-6;
      }
    }
  }

  @each $color in $colors {
    &--color--#{$color} {
      &:focus {
        @apply outline-[--color-#{$color}-100];
      }

      &:not([class*="--solid--"]) #{$loaderIcon} {
        @apply border-[--color-#{$color}-100] border-r-[--color-#{$color}-500];
      }
    }

    &--solid--#{$color} {
      @apply bg-[--color-#{$color}-500]
      border-[--color-#{$color}-500]
      text-[--color-additional-50];

      &:hover:not(#{$loading}, #{$disabled}) {
        @apply bg-[--color-#{$color}-700]
        border-[--color-#{$color}-700];
      }

      & #{$loaderIcon} {
        @apply border-[--color-#{$color}-200] border-r-[--color-additional-50];
      }
    }

    &--solid-lightest--#{$color} {
      @apply bg-[--color-additional-50] text-[--color-#{$color}-500] border-[--color-additional-50];

      &:hover:not(#{$loading}, #{$disabled}) {
        @apply bg-[--color-#{$color}-50] text-[--color-#{$color}-700] border-[--color-#{$color}-50];
      }
    }

    &--outline--#{$color} {
      @apply bg-[--color-additional-50] text-[--color-#{$color}-500] border-current;

      &:hover:not(#{$loading}, #{$disabled}) {
        @apply text-[--color-#{$color}-700];
      }
    }

    &--no-background--#{$color} {
      @apply bg-transparent text-[--color-#{$color}-500] border-transparent;

      &:hover:not(#{$loading}, #{$disabled}) {
        @apply text-[--color-#{$color}-700];
      }
    }
  }

  &:disabled#{$disabled}:not(#{$loading}) {
    &[class*="--solid-"] {
      @apply bg-[--color-neutral-100] border-[--color-neutral-100] text-[--color-neutral-400];
    }

    &[class*="--solid-lightest--"] {
      @apply bg-[--color-neutral-50] border-[--color-neutral-50] text-[--color-neutral-400];
    }

    &[class*="--outline--"] {
      @apply text-[--color-neutral-400] border-[--color-neutral-300];
    }

    &[class*="--no-background--"] {
      @apply text-[--color-neutral-400];
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
