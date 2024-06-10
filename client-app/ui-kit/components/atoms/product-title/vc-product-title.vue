<template>
  <div
    :class="[
      'vc-product-title',
      `vc-product-title--lines--${linesNumber}`,
      {
        'vc-product-title--link': linkTo,
        'vc-product-title--disabled': disabled,
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
      <slot />
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
  target?: "_blank" | "_self";
  title?: string;
  disabled?: boolean;
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
  $disabled: "";
  $link: "";

  --font-size: var(--vc-product-title-font-size);

  @apply text-[length:var(--font-size)] font-bold line-clamp-3;

  @apply leading-[1.17] #{!important};

  &--lines {
    &--1 {
      @apply line-clamp-1;
    }

    &--2 {
      @apply line-clamp-2;
    }

    &--3 {
      @apply line-clamp-3;
    }
  }

  &--disabled {
    $disabled: &;
  }

  &--link {
    $link: &;
  }

  &__text {
    color: var(--body-text-color);

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
}
</style>
