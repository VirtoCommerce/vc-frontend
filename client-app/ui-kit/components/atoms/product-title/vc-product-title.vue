<template>
  <component
    :is="componentType"
    :to="linkTo"
    :target="target"
    :title="title"
    :class="[
      'vc-product-title',
      {
        'vc-product-title--disabled': disabled || !to,
      },
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </component>
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
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  to: null,
});

const componentType = computed(() => (!props.disabled && props.to ? "router-link" : "div"));
const linkTo = computed(() => (!props.disabled ? props.to : ""));
</script>

<style lang="scss">
.vc-product-title {
  $disabled: "";

  --font-size: var(--vc-product-title-font-size);

  @apply text-[length:var(--font-size)] text-[--color-accent-600] font-bold line-clamp-3 cursor-pointer;

  @apply leading-[1.17] #{!important};

  &--disabled {
    $disabled: &;

    @apply text-[--color-neutral-500] cursor-not-allowed;
  }

  &:hover:not(#{$disabled}) {
    @apply text-[--color-accent-700];
  }
}
</style>
