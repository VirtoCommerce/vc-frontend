<template>
  <component
    :is="componentTag"
    v-bind="attrs"
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

interface IAttributes {
  to?: RouteLocationRaw | null;
  href?: string;
}

interface IProps {
  color?: "primary" | "secondary" | "success" | "info" | "neutral" | "warning" | "danger" | "accent";
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "no-border" | "no-background";
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
  minWidth?: string;
  tag?: string;
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
  minWidth: "",
  tag: "",
});

const enabled = eagerComputed<boolean>(() => !props.disabled && !props.loading);
const isRouterLink = eagerComputed<boolean>(() => !!props.to && enabled.value);
const isExternalLink = eagerComputed<boolean>(() => !!props.externalLink && enabled.value);

const target = computed<string | undefined>(() =>
  props.target && (isExternalLink.value || isRouterLink.value) ? props.target : undefined,
);

const componentTag = computed(() => {
  if (props.tag) {
    return props.tag;
  }

  if (isRouterLink.value) {
    return "router-link";
  }

  if (isExternalLink.value) {
    return "a";
  }

  return "button";
});

const attrs = computed(() => {
  const attributes: IAttributes = {};

  if (componentTag.value === "router-link") {
    attributes.to = props.to;
  }

  if (componentTag.value === "a") {
    attributes.href = props.externalLink;
  }

  return attributes;
});
</script>

<style lang="scss">
.vc-button {
  --props-min-width: v-bind(props.minWidth);
  --min-w: var(--props-min-width, var(--vc-button-min-width, auto));

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

  &:not(#{$icon}) {
    @apply min-w-[--min-w];
  }

  &--size {
    &--xs {
      --line-height: 0.875rem;

      @apply px-3 py-1.5 text-xs/[--line-height] font-bold;

      &#{$icon} {
        @apply px-1.5;
      }

      & #{$loaderIcon} {
        @apply border-2 size-3.5;
      }
    }

    &--sm {
      --line-height: 1.25rem;

      @apply px-3.5 py-1.5 text-xs/[--line-height] uppercase font-black;

      &#{$icon} {
        @apply px-1.5;
      }

      & #{$loaderIcon} {
        @apply border-2 size-5;
      }
    }

    &--md {
      --line-height: 1.25rem;

      @apply px-4 py-2.5 text-sm/[--line-height] uppercase font-black;

      &#{$icon} {
        @apply px-2.5;
      }

      & #{$loaderIcon} {
        @apply border-[3px] w-5 h-5;
      }
    }

    &--lg {
      --line-height: 1.5rem;

      @apply px-5 py-3 text-base/[--line-height] uppercase font-black;

      &#{$icon} {
        @apply px-3;
      }

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
        @apply border-[--color-#{$color}-100] border-r-[--color-#{$color}-600];
      }
    }

    &--solid--#{$color} {
      @apply bg-[--color-#{$color}-600]
      border-[--color-#{$color}-600]
      text-additional-50;

      &:hover:not(#{$loading}, #{$disabled}) {
        @apply bg-[--color-#{$color}-700]
        border-[--color-#{$color}-700];
      }

      & #{$loaderIcon} {
        @apply border-[--color-#{$color}-200] border-r-additional-50;
      }
    }

    &--no-border--#{$color} {
      @apply bg-additional-50 text-[--color-#{$color}-600] border-additional-50;

      &:hover:not(#{$loading}, #{$disabled}) {
        @apply bg-[--color-#{$color}-100] border-[--color-#{$color}-100] text-[--color-#{$color}-700];
      }
    }

    &--outline {
      &--#{$color} {
        @apply bg-additional-50
        text-[--color-#{$color}-600]
        border-current;

        &:hover:not(#{$loading}, #{$disabled}) {
          @apply text-[--color-#{$color}-700];
        }
      }
    }

    &--no-background--#{$color} {
      @apply bg-transparent text-[--color-#{$color}-600] border-transparent;

      &:hover:not(#{$loading}, #{$disabled}) {
        @apply text-[--color-#{$color}-700];
      }
    }
  }

  &#{$disabled}:not(#{$loading}),
  &:disabled#{$disabled}:not(#{$loading}) {
    &[class*="--solid--"] {
      @apply bg-neutral-200 border-neutral-200 text-neutral-400;
    }

    &[class*="--no-border--"] {
      @apply bg-neutral-50 border-neutral-50 text-neutral-400;
    }

    &[class*="--outline--"] {
      @apply text-neutral-400 border-neutral-300;
    }

    &[class*="--no-background--"] {
      @apply text-neutral-400;
    }
  }

  &__content {
    @apply grid grid-flow-col justify-center;

    --vc-icon-size: var(--line-height);

    #{$loading} & {
      @apply invisible;
    }
  }

  &__slot {
    @apply max-w-full;

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
