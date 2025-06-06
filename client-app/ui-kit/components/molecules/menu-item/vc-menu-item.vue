<template>
  <component :is="componentTag" :id="componentId" v-bind="$attrs" ref="currentElement" class="vc-menu-item" role="none">
    <component
      :is="innerTag"
      v-bind="attrs"
      :disabled="disabled"
      :title="title"
      :role="role"
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
import { ref, computed, onMounted } from "vue";
import { getLinkAttr } from "@/core/utilities/common";
import { useComponentId } from "@/ui-kit/composables";
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
}

defineOptions({
  inheritAttrs: false,
});

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  color: "primary",
  size: "md",
  clickable: true,
  maxLines: "",
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

    @apply flex items-center w-full px-3 text-left rounded-[inherit] text-sm/[0.875rem];

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
        --content-height: 0.875rem;

        @apply gap-1.5 py-1.5;
      }

      &--sm {
        --content-height: 1rem;

        @apply gap-1.5 py-2.5;
      }

      &--md {
        --content-height: 1.25rem;

        @apply gap-1.5 py-2.5;
      }

      &--lg {
        --content-height: 2rem;

        @apply gap-2 py-2;
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
          @apply outline-[--focus-color] -outline-offset-1;
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
