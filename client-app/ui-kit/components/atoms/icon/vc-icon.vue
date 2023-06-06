<template>
  <svg :class="[`vc-icon`, typeof size === 'string' ? `vc-icon--size--${size}` : '']" :style="style">
    <use :href="`/static/icons/basic/${name}.svg#icon`"></use>
  </svg>
</template>

<script setup lang="ts">
interface IProps {
  name?: string;
  size?: "xxs" | "xs" | "sm" | "md" | number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: "document-text",
  size: "md",
});

const style =
  typeof props.size === "number"
    ? {
        width: `${props.size}px`,
        height: `${props.size}px`,
      }
    : {};
</script>

<style lang="scss">
.vc-icon {
  @apply inline-block align-top leading-none text-inherit;

  &--size {
    &--xxs {
      @apply w-2.5 h-2.5;
    }

    &--xs {
      @apply w-3.5 h-3.5;
    }

    &--sm {
      @apply w-5 h-5;
    }

    &--md {
      @apply w-6 h-6;
    }
  }
}
</style>
