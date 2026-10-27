<template>
  <span class="return-item-image">
    <VcImage :src="src" alt="" class="return-item-image__img" />
  </span>
</template>

<script setup lang="ts">
interface IProps {
  src: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.return-item-image {
  @apply flex size-10 flex-none overflow-hidden rounded-[--vc-radius] border border-neutral-200 bg-additional-50;

  &__img {
    @apply size-full object-contain;
  }
}
</style>
