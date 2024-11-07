<template>
  <div
    :class="[
      'vc-product-title',
      {
        'vc-product-title--link': linkTo,
        'vc-product-title--disabled': disabled,
        'vc-product-title--fix-height': fixHeight,
      },
    ]"
  >
    <component
      :is="componentType"
      :to="linkTo"
      :target="to ? target : null"
      :title="title"
      class="vc-product-title__text"
      @click="$emit('click', $event)"
    >
      <slot>{{ title }}</slot>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "click", globalEvent: PointerEvent): void;
}

interface IProps {
  to?: RouteLocationRaw | null;
  target?: BrowserTargetType;
  title?: string;
  disabled?: boolean;
  fixHeight?: boolean;
  linesNumber?: number | string;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  to: null,
  linesNumber: 3,
});

const componentType = computed(() => (!props.disabled && props.to ? "router-link" : "div"));
const linkTo = computed(() => (!props.disabled ? props.to : ""));
</script>

<style lang="scss">
.vc-product-title {
  $self: &;
  $disabled: "";
  $link: "";

  --font-size: var(--vc-product-title-font-size);
  --lines-number: v-bind(linesNumber);
  --link-color: var(--vc-product-title-link-color, theme("colors.accent.600"));
  --link-hover-color: var(--vc-product-title-link-hover-color, theme("colors.accent.700"));

  @apply text-[length:var(--font-size)] font-bold line-clamp-[--lines-number];

  @apply leading-[1.17em] #{!important};

  &--fix-height {
    height: calc(1.17em * var(--lines-number));
  }

  &--disabled {
    $disabled: &;
  }

  &--link {
    $link: &;
  }

  &__text {
    color: var(--body-text-color);
    word-wrap: break-word;

    #{$link}:not(#{$disabled}) & {
      @apply cursor-pointer;

      color: var(--link-color);

      &:hover {
        color: var(--link-hover-color);
      }
    }

    #{$disabled} & {
      @apply text-neutral pointer-events-none;
    }
  }

  @at-root .vc-product-card {
    #{$self} {
      grid-area: title;

      @apply text-sm;
    }

    &--view-mode {
      &--grid #{$self} {
        @container (min-width: theme("containers.xxs")) {
          @apply text-lg;
        }
      }

      &--list {
        #{$self} {
          @apply self-end;

          &:only-child {
            @apply self-center;
          }
        }

        @container (min-width: theme("containers.xl")) {
          &:not(:has(.vc-product-vendor, .vc-product-action)) #{$self} {
            @apply self-center;
          }
        }
      }

      &--item {
        #{$self} {
          @apply self-center;
        }

        &:has(.vc-product-vendor) #{$self} {
          @apply self-end;
        }

        @container (min-width: theme("containers.2xl")) {
          @apply self-end;

          &:not(:has(.vc-product-vendor)) #{$self} {
            @apply self-center;
          }
        }
      }
    }
  }
}
</style>
