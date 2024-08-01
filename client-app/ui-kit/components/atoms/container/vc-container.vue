<template>
  <div
    :class="[
      'vc-container',
      {
        'vc-container--loading': loading,
      },
    ]"
  >
    <div class="vc-container__wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  loading?: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-container {
  @apply grow bg-[--body-bg-color] p-6 md:pb-9 lg:px-8 2xl:px-12;

  &--loading {
    @apply pointer-events-none opacity-50;
  }

  &__wrapper {
    @apply mx-auto max-w-[87.75rem];
  }
}
</style>
