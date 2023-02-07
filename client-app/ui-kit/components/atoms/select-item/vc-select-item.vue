<template>
  <span :class="['vc-select-item', { 'vc-select-item--bordered': bordered }]">
    <slot />
  </span>
</template>

<script setup lang="ts">
interface IProps {
  bordered?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-select-item {
  @apply flex items-center gap-3 p-3 max-w-full max-h-full;

  &--bordered {
    @at-root *:not(:last-of-type) > & {
      @apply border-b;
    }
  }
}
</style>
