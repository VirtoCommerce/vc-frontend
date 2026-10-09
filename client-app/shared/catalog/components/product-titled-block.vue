<template>
  <div class="product-titled-block">
    <div class="product-titled-block__header">
      <VcShape :icon="icon" />

      <h2 class="product-titled-block__title">{{ title }}</h2>

      <slot name="after" />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
interface IProps {
  icon: string;
  title: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.product-titled-block {
  @apply space-y-4;

  &__header {
    @apply flex items-center gap-2;
  }

  &__title {
    @apply grow text-xl font-bold uppercase text-neutral-950;
  }
}
</style>
