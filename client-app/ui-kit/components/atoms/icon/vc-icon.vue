<template>
  <svg :class="[`vc-icon`, `vc-icon--size--${size}`]">
    <use :href="`/static/icons/basic/${name}.svg#icon`"></use>
  </svg>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  name: {
    type: String,
    default: "document-text",
  },

  size: {
    type: String as PropType<"xxs" | "xs" | "sm" | "md">,
    default: "md",
    validator: (value: string) => !value || ["xxs", "xs", "sm", "md"].includes(value),
  },
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
  }
}
</style>
