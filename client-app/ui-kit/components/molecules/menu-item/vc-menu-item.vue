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
      ref="innerElement"
      v-bind="attrs"
      :disabled="disabled"
      :title="title"
      :role="effectiveRole"
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
      @focus="menuList?.onItemFocus(listItem)"
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
import { ref, computed, provide, onMounted, inject, onBeforeUnmount } from "vue";
import {
  VC_MENU_LIST_CHECKABLE_ROLES,
  VC_MENU_LIST_ITEM_ROLES,
  vcMenuListKey,
} from "@/ui-kit/components/molecules/menu-list/vc-menu-list-context";
import { useComponentId } from "@/ui-kit/composables";
import { getLinkAttr } from "@/ui-kit/utilities";
import { INTERACTIVE_PARENT_KEY } from "./vc-menu-item-context";
import type { ComponentPublicInstance } from "vue";
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
  /** The current or selected item's look. In any `VcMenuList` it is also the tab stop; in a `role="listbox"` also the selection (`aria-selected`). */
  active?: boolean;
  disabled?: boolean;
  truncate?: boolean;
  nowrap?: boolean;
  maxLines?: number | string;
  tag?: string;
  clickable?: boolean;
  /** ARIA role of the inner element. In a `VcMenuList` it defaults to `option` (listbox) or `menuitem` (menu); a role of your own wins. */
  role?: string;
  /** Rendered for roles that support it (`option`, `tab`, …). In a `VcMenuList role="listbox"` it follows `active` unless you set it. */
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
  // Without it Vue casts an unset boolean to `false`, and in a listbox `aria-selected` could not follow `active`.
  ariaSelected: undefined,
});

const currentElement = ref<HTMLElement>();
const parentTag = ref("");
const enabled = computed<boolean>(() => !props.disabled);
const isRouterLink = computed<boolean>(() => !!props.to && enabled.value);
const isExternalLink = computed<boolean>(
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

const menuList = inject(vcMenuListKey, null);
const innerElement = ref<HTMLElement | ComponentPublicInstance | null>(null);
const listItem: VcMenuListItemType = {
  el: () => {
    const value = innerElement.value;

    return value && "$el" in value ? (value.$el as HTMLElement) : value;
  },
  active: () => props.active,
  disabled: () => props.disabled || !isInteractive.value,
};

if (menuList) {
  onBeforeUnmount(menuList.register(listItem));
}

// Only an item rendered inside the list's root joins it; a teleported one stays as it is outside a list.
const isListMember = computed(() => !!menuList?.contains(listItem));

const effectiveRole = computed(() => props.role ?? (isListMember.value ? menuList?.itemRole.value : undefined));

// A list has one tab stop; the arrow keys reach the other items.
const tabindex = computed(() => (isListMember.value && !menuList?.isTabStop(listItem) ? -1 : 0));

const attrs = computed(() => {
  if (innerTag.value === "router-link") {
    return { to: props.to, target: props.target, tabindex: tabindex.value };
  }

  if (innerTag.value === "a") {
    return { href: props.externalLink, target: props.target, tabindex: tabindex.value };
  }

  if (innerTag.value === "button") {
    return { type: "button", tabindex: tabindex.value };
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
  if (effectiveRole.value && ARIA_SELECTED_ROLES.has(effectiveRole.value)) {
    // In a listbox `active` is the selection; elsewhere an unset value renders `false`.
    return props.ariaSelected ?? (isListMember.value && menuList?.listRole.value === "listbox" && props.active);
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
  if (effectiveRole.value) {
    return "none";
  }
  return undefined;
});

onMounted(() => {
  parentTag.value = currentElement.value?.parentElement?.tagName.toLowerCase() ?? "";

  const listRole = menuList?.listRole.value;

  if (import.meta.env.DEV && listRole && props.role && isListMember.value) {
    if (!VC_MENU_LIST_ITEM_ROLES[listRole].includes(props.role)) {
      const problem =
        listRole === "menu" && VC_MENU_LIST_CHECKABLE_ROLES.includes(props.role)
          ? `is not supported in a VcMenuList role="menu": its aria-checked would land on VcMenuItem's wrapper`
          : `does not belong in a VcMenuList role="${listRole}"`;
      // eslint-disable-next-line no-console
      console.warn(`[VcMenuItem] role="${props.role}" ${problem}.`);
    }
  }
});
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

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

    @apply flex items-center w-full text-left font-normal;

    padding-inline: var(--vc-menu-item-padding-x, theme("padding.3"));
    // `inherit` sits in the property itself: routed through a private variable it is no longer the keyword.
    border-radius: var(--vc-menu-item-radius, inherit);
    background-color: var(--vc-menu-item-bg-color, theme("colors.additional.50"));

    &:not(:disabled) {
      @apply text-neutral-950;
    }

    &--active {
      $active: &;

      @apply font-bold;
    }

    &--truncate {
      $truncate: &;
    }

    &--nowrap {
      @apply whitespace-nowrap;
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

        &:hover {
          background-color: var(--vc-menu-item-hover-bg-color, var(--color-#{$color}-50));
        }

        &#{$active} {
          background-color: var(--vc-menu-item-active-bg-color, var(--color-#{$color}-100));
        }
      }
    }

    // Menu lists render inside a VcScrollbar with zero clearance (measured in the
    // language dropdown), so an outset ring is clipped: invert the shared offset.
    &:focus-visible {
      @include focus-ring($inset: true);
    }

    &:disabled,
    &--disabled {
      --vc-icon-color: var(--color-neutral-400);

      @apply text-neutral-400 cursor-not-allowed;
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
