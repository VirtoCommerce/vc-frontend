<template>
  <svg :class="[`vc-icon`, `vc-icon--size-${size}`]">
    <use :href="url"></use>
  </svg>
</template>

<script setup lang="ts">
defineProps({
  url: {
    type: String,
    default: "/static/images/information-circle.svg#main",
  },
  size: {
    type: String,
    default: "md",
    validator: (value: string) => !value || ["xs", "sm", "md", "lg", "xl"].includes(value),
  },
});
</script>

<style lang="scss">
.vc-icon {
  color: var(--vc-icon-color, currentColor);

  &--size-xs {
    @apply w-4 h-4;
  }

  &--size-sm {
    @apply w-5 h-5;
  }

  &--size-md {
    @apply w-6 h-6;
  }

  &--size-lg {
  }

  &--size-xl {
  }
}
</style>
