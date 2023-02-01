<template>
  <slot>
    <VcImage :src="src" class="vc-select-image" />
  </slot>
</template>

<script setup lang="ts">
interface Props {
  src?: string;
}

defineProps<Props>();
</script>

<style lang="scss">
.vc-select-image {
  @apply order-1 w-[3.125rem] h-[3.125rem];
}
</style>
