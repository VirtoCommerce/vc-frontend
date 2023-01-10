<template>
  <svg :class="[`vc-icon`, `vc-icon--size-${size}`]">
    <use :href="`/static/icons/basic/${name}.svg#icon`"></use>
  </svg>
</template>

<script setup lang="ts">
import { PropType } from "vue";

defineProps({
  name: {
    type: String,
    default: "document-text",
  },
  size: {
    type: String as PropType<"xs" | "sm" | "md">,
    default: "md",
    validator: (value: string) => !value || ["xs", "sm", "md"].includes(value),
  },
});
</script>

<style lang="scss">
.vc-icon {
  --vc-icon-color: var(--color-icon-color, currentColor);

  @apply text-[color:var(--vc-icon-color)];

  &--size-xs {
    @apply w-3.5 h-3.5;
  }

  &--size-sm {
    @apply w-5 h-5;
  }

  &--size-md {
    @apply w-6 h-6;
  }
}
</style>
