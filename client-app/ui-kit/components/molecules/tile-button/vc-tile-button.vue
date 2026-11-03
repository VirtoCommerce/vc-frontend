<template>
  <component
    :is="componentTag"
    v-bind="linkAttrs"
    :type="componentTag === 'button' ? 'button' : undefined"
    :disabled="disabled || undefined"
    :class="['vc-tile-button', `vc-tile-button--${variant}--${color}`, { 'vc-tile-button--disabled': disabled }]"
    @click="onClick"
  >
    <span v-if="$slots.icon || icon" class="vc-tile-button__icon">
      <slot name="icon">
        <VcIcon v-if="icon" :name="icon" />
      </slot>
    </span>

    <span class="vc-tile-button__label">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "click", value: MouseEvent): void;
}

interface IProps {
  /** Icon above the label. */
  icon?: string;
  /** `solid` fills the tile with `color`; `outline` keeps a neutral surface and paints only the icon. */
  variant?: VcTileButtonVariantType;
  color?: VcTileButtonColorType;
  /** Renders a disabled `<button>`, even when `to` or `externalLink` is set. */
  disabled?: boolean;
  /** Renders a `router-link`. */
  to?: RouteLocationRaw | null;
  /** Renders an `<a href>`. */
  externalLink?: string;
  /** Applies to `to` and `externalLink`; `_blank` adds `rel="noopener noreferrer"`. */
  target?: "_self" | "_blank";
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  variant: "solid",
  color: "primary",
  to: null,
});

defineSlots<{
  /** Tile label. */
  default?: () => unknown;
  /** Content above the label in place of the `icon` prop's icon; `--vc-icon-size` and `--vc-icon-color` still reach a VcIcon put here. */
  icon?: () => unknown;
}>();

const componentTag = computed(() => {
  if (props.disabled) {
    return "button";
  }

  if (props.to) {
    return "router-link";
  }

  if (props.externalLink) {
    return "a";
  }

  return "button";
});

const linkAttrs = computed(() => {
  if (componentTag.value === "button") {
    return {};
  }

  return {
    ...(componentTag.value === "router-link" ? { to: props.to } : { href: props.externalLink }),
    target: props.target,
    rel: props.target === "_blank" ? "noopener noreferrer" : undefined,
  };
});

function onClick(event: MouseEvent): void {
  if (!props.disabled) {
    emit("click", event);
  }
}
</script>

<style lang="scss">
.vc-tile-button {
  $colors: primary, secondary, accent, neutral, info, success, warning, danger;
  $variants: solid, outline;

  $disabled: "";

  --radius: var(--vc-tile-button-radius, var(--vc-radius, 0.5rem));
  --min-height: var(--vc-tile-button-min-height, 6rem);

  --vc-icon-size: var(--vc-tile-button-icon-size, 1.5rem);

  // Solid primary is the base, so an unknown variant or color still renders a filled tile.
  --bg-color: var(--vc-tile-button-solid-primary-bg);
  --border-color: var(--vc-tile-button-solid-primary-border);
  --text-color: var(--vc-tile-button-solid-primary-text);
  --vc-icon-color: var(--vc-tile-button-solid-primary-icon);

  @apply flex min-h-[--min-height] flex-col items-center justify-center gap-2 rounded-[--radius] border-2 border-[--border-color] bg-[--bg-color] px-2 py-3 text-center text-sm leading-tight text-[--text-color] select-none;

  @each $variant in $variants {
    @each $color in $colors {
      &--#{$variant}--#{$color} {
        --bg-color: var(--vc-tile-button-#{$variant}-#{$color}-bg);
        --border-color: var(--vc-tile-button-#{$variant}-#{$color}-border);
        --text-color: var(--vc-tile-button-#{$variant}-#{$color}-text);
        --vc-icon-color: var(--vc-tile-button-#{$variant}-#{$color}-icon);
      }
    }
  }

  &--disabled {
    $disabled: &;

    @apply cursor-not-allowed opacity-60;
  }

  &:hover:not(#{$disabled}) {
    @apply shadow-lg;
  }

  @media (prefers-reduced-motion: no-preference) {
    @apply transition-shadow;
  }

  &__icon {
    @apply flex items-center justify-center;
  }

  &__label {
    @apply max-w-full break-words;
  }
}
</style>
