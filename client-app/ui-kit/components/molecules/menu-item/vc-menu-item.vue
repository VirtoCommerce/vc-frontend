<template>
  <component
    :is="componentTag"
    :id="componentId"
    v-bind="$attrs"
    ref="currentElement"
    class="vc-menu-item"
    :role="wrapperRole"
  >
    <component
      :is="innerTag"
      :id="optionId"
      v-bind="attrs"
      :disabled="disabled"
      :title="title"
      :role="role"
      :aria-selected="computedAriaSelected"
      :class="[
        'vc-menu-item__inner',
        `vc-menu-item__inner--size--${size}`,
        `vc-menu-item__inner--color--${color}`,
        {
          'vc-menu-item__inner--active': active,
          'vc-menu-item__inner--disabled': disabled,
          'vc-menu-item__inner--truncate': truncate,
          'vc-menu-item__inner--nowrap': nowrap,
          'vc-menu-item__inner--max-lines': maxLines,
        },
      ]"
      @click="enabled ? $emit('click', $event) : null"
    >
      <span v-if="$slots.prepend" class="vc-menu-item__prepend">
        <slot name="prepend" />
      </span>

      <span class="vc-menu-item__content">
        <slot />
      </span>

      <span v-if="$slots.append" class="vc-menu-item__append">
        <slot name="append" />
      </span>
    </component>
  </component>
</template>

<script setup lang="ts">
import { eagerComputed } from "@vueuse/core";
import { ref, computed, provide, onMounted } from "vue";
import { getLinkAttr } from "@/core/utilities/common";
import { useComponentId } from "@/ui-kit/composables";
import { INTERACTIVE_PARENT_KEY } from "./vc-menu-item-context";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "click", value: MouseEvent): void;
}

interface IProps {
  color?: VcMenuItemColorType;
  size?: "xs" | "sm" | "md" | "lg";
  to?: RouteLocationRaw;
  externalLink?: string;
  target?: "_self" | "_blank";
  title?: string;
  active?: boolean;
  disabled?: boolean;
  truncate?: boolean;
  nowrap?: boolean;
  maxLines?: number | string;
  tag?: string;
  clickable?: boolean;
  role?: string;
  ariaSelected?: boolean;
  optionId?: string;
}

defineOptions({
  inheritAttrs: false,
});

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "primary",
  size: "md",
  clickable: true,
});

const currentElement = ref<HTMLElement>();
const parentTag = ref("");
const enabled = eagerComputed<boolean>(() => !props.disabled);
const isRouterLink = eagerComputed<boolean>(() => !!props.to && enabled.value);
const isExternalLink = eagerComputed<boolean>(
  () => ("externalLink" in getLinkAttr(props.to) || !!props.externalLink) && enabled.value,
);
const componentId = useComponentId("menu-item");

const componentTag = computed(() => {
  if (props.tag) {
    return props.tag;
  }

  if (parentTag.value === "ul" || parentTag.value === "ol") {
    return "li";
  }

  return "div";
});

const innerTag = computed(() => {
  if (isExternalLink.value) {
    return "a";
  }

  if (isRouterLink.value) {
    return "router-link";
  }

  if (props.clickable) {
    return "button";
  }

  return "span";
});

const isInteractive = computed(
  () => innerTag.value === "button" || innerTag.value === "a" || innerTag.value === "router-link",
);
provide(INTERACTIVE_PARENT_KEY, isInteractive);

const attrs = computed(() => {
  if (innerTag.value === "router-link") {
    return { to: props.to, target: props.target, tabindex: 0 };
  }

  if (innerTag.value === "a") {
    return { href: props.externalLink, target: props.target, tabindex: 0 };
  }

  if (innerTag.value === "button") {
    return { type: "button", tabindex: 0 };
  }

  return {};
});

/**
 * Roles that support the `aria-selected` attribute per WAI-ARIA spec.
 */
const ARIA_SELECTED_ROLES = new Set(["option", "tab", "gridcell", "row", "treeitem", "columnheader", "rowheader"]);

/**
 * Only render `aria-selected` when the inner element has a role that supports it.
 * Plain buttons (implicit role="button") must not have `aria-selected`.
 */
const computedAriaSelected = computed(() => {
  if (props.role && ARIA_SELECTED_ROLES.has(props.role)) {
    return props.ariaSelected;
  }
  return undefined;
});

/**
 * The outer wrapper role:
 * - When the inner element carries its own ARIA role (e.g. "option" inside a listbox),
 *   the wrapper is purely presentational → role="none".
 * - Otherwise, omit the role so that <li> keeps its natural "listitem" semantics
 *   inside a <ul>, satisfying the "list" a11y rule.
 */
const wrapperRole = computed(() => {
  if (props.role) {
    return "none";
  }
  return undefined;
});

onMounted(() => {
  parentTag.value = currentElement.value?.parentElement?.tagName.toLowerCase() ?? "";
});
</script>

<style lang="scss">
.vc-menu-item {
  --props-max-lines: v-bind(maxLines);
  --max-lines: var(--props-max-lines, 2);

  $colors: primary, secondary, success, info, warning, danger, neutral;

  $active: "";
  $truncate: "";
  $maxLines: "";

  @apply list-none select-none;

  &__inner {
    --vc-icon-size: var(--content-height);

    @apply flex items-center w-full px-3 text-left rounded-[inherit] font-normal;

    &:not(:disabled) {
      @apply bg-additional-50 text-neutral-950;
    }

    &--active {
      $active: &;

      @apply font-bold;
    }

    &--truncate {
      $truncate: &;
    }

    &--nowrap {
      @apply whitespace-nowrap #{!important};
    }

    &--max-lines {
      $maxLines: &;
    }

    &--size {
      &--xs {
        --content-height: 1rem;

        @apply gap-1.5 py-1 text-xs/[0.875rem];
      }

      &--sm {
        --content-height: 1rem;

        @apply gap-1.5 py-2.5 text-sm/[0.875rem];
      }

      &--md {
        --content-height: 1.25rem;

        @apply gap-1.5 py-2.5 text-sm/[0.875rem];
      }

      &--lg {
        --content-height: 2rem;

        @apply gap-2 py-2 text-sm/[0.875rem];
      }
    }

    @each $color in $colors {
      &--color--#{$color} {
        --vc-icon-color: var(--color-#{$color}-600);
        --focus-color: rgb(from var(--color-#{$color}-500) r g b / 0.3);

        &:hover {
          @apply bg-[--color-#{$color}-50] outline-none;
        }

        &:focus,
        &:focus-visible {
          @apply outline-[--focus-color] -outline-offset-1 rounded;
        }

        &#{$active} {
          @apply bg-[--color-#{$color}-100];
        }
      }
    }

    &:disabled,
    &--disabled {
      --vc-icon-color: var(--color-neutral-400);

      @apply bg-additional-50 text-neutral-400 cursor-not-allowed;
    }
  }

  &__prepend {
    @apply flex-none flex items-center h-[--content-height] empty:hidden;
  }

  &__content {
    @apply grow flex items-center gap-[inherit] min-h-[var(--content-height)] break-all;

    #{$truncate} & {
      @apply min-w-0 truncate;
    }

    #{$truncate} & > * {
      @apply min-w-0 truncate;
    }

    #{$maxLines} & {
      @apply line-clamp-[var(--max-lines)];
    }
  }

  &__append {
    @apply flex-none flex items-center h-[--content-height] empty:hidden;
  }

  .vc-icon {
    @apply flex-none;
  }
}
</style>
