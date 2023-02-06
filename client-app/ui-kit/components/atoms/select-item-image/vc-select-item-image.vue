<template>
  <VcImage :src="src" class="vc-select-item-image" lazy />
</template>

<script setup lang="ts">
interface IProps {
  src?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-select-item-image {
  @apply order-1 w-[3.125rem] h-[3.125rem];
}
</style>
