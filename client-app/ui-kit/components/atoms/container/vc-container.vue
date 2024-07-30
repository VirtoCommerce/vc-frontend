<template>
  <div :class="['vc-container', { 'vc-container--transparent': isTransparent }]">
    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  isTransparent?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-container {
  @apply grow bg-[--body-bg-color] p-6 md:pb-9 lg:px-8 2xl:px-12;

  &__wrapper {
    @apply mx-auto max-w-[87.75rem];
  }

  &--transparent {
    @apply bg-transparent;
  }
}
</style>
