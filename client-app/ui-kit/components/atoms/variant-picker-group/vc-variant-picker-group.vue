<template>
  <div class="vc-variant-picker-group" :data-test-id="testIdInput">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  testIdInput?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-variant-picker-group {
  @apply flex flex-wrap gap-2.5;
}
</style>
