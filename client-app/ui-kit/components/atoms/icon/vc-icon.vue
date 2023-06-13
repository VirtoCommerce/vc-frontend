<template>
  <svg :class="[`vc-icon`, `vc-icon--size--${size}`]">
    <use :href="`/static/icons/basic/${name}.svg#icon`"></use>
  </svg>
</template>

<script setup lang="ts">
interface IProps {
  name?: string;
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

withDefaults(defineProps<IProps>(), {
  name: "document-text",
  size: "md",
});
</script>

<style lang="scss">
.vc-icon {
  @apply text-inherit;

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

    &--lg {
      @apply w-10 h-10;
    }

    &--xl {
      @apply w-12 h-12;
    }

    &--xxl {
      @apply w-16 h-16;
    }
  }
}
</style>
