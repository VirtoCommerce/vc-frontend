<template>
  <component
    :is="componentTag"
    v-bind="attrs"
    :target="target"
    :type="componentTag === 'button' ? type : null"
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
  color?: VcButtonColorType;
  size?: VcButtonSizeType;
  variant?: VcButtonVariantType;
  type?: VcButtonTypeType;
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
  iconSize?: string;
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
  iconSize: "",
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
  --props-icon-size: v-bind(props.iconSize);
  --min-w: var(--props-min-width, var(--vc-button-min-width, auto));

  --vc-icon-size: var(--vc-button-icon-size, var(--props-icon-size, var(--line-height)));

  $colors: primary, secondary, success, info, neutral, warning, danger, accent;

  $prepend: "";
  $append: "";
  $icon: "";
  $truncate: "";
  $disabled: "";
  $loading: "";
  $loaderIcon: "";
  $noWrap: "";

  @apply relative rounded border-2 select-none text-center;

  appearance: button;

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

    @apply block rounded-full animate-spin border-2 size-[--line-height];
  }

  &:not(#{$icon}) {
    @apply min-w-[--min-w];
  }

  &--size {
    &--xxs {
      --size: 1.375rem;
      --line-height: 0.875rem;
      --px: theme("padding.2");

      @apply text-xs/[--line-height] font-bold;
    }

    &--xs {
      --size: 1.625rem;
      --line-height: 0.875rem;
      --px: theme("padding.3");

      @apply text-xs/[--line-height] font-bold;
    }

    &--sm {
      --size: 2rem;
      --line-height: 1rem;
      --px: theme("padding[3.5]");

      @apply text-xs/[--line-height] uppercase font-black;
    }

    &--md {
      --size: 2.5rem;
      --line-height: 1.25rem;
      --px: theme("padding.4");

      @apply text-sm/[--line-height] uppercase font-black;
    }

    &--lg {
      --size: 3rem;
      --line-height: 1.5rem;
      --px: theme("padding.5");

      @apply text-base/[--line-height] uppercase font-black;
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
    @apply grid grid-flow-col justify-center items-center min-h-[--size] px-[--px];

    #{$icon} & {
      @apply p-0 size-[--size];
    }

    #{$loading} & {
      @apply invisible;
    }
  }

  &__slot {
    @apply max-w-full;

    word-break: break-word;

    #{$icon} & {
      @apply size-[--vc-icon-size];
    }

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
