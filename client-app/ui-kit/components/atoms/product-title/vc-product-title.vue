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
  $disabled: "";
  $link: "";

  --font-size: var(--vc-product-title-font-size);
  --lines-number: v-bind(linesNumber);

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
}
</style>
