<template>
  <figure class="vc-select-item-image">
    <VcImage :src="src" class="vc-select-item-image__picture" lazy />
  </figure>
</template>

<script setup lang="ts">
interface IProps {
  src?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-select-item-image {
  @apply rounded-[4px] overflow-hidden;

  &__picture {
    @apply w-[3.125rem] h-[3.125rem] object-cover object-center;
  }
}
</style>
