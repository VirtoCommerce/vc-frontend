<template>
  <span class="select-item">
    <VcImage v-if="image" :src="image" class="select-item__img" />

    <span class="select-item__content">
      <span class="select-item__title">{{ title }}</span>

      <span v-if="description" class="select-item__description" :v-html="description"></span>
    </span>
  </span>
</template>

<script setup lang="ts">
interface Props {
  image: string;
  title: string;
  description?: string;
}

defineProps<Props>();
</script>

<style lang="scss">
.select-item {
  @apply flex items-center gap-3 p-3;

  &__img {
    @apply w-[3.125rem] h-[3.125rem];
  }

  &__content {
    @apply grow flex flex-col gap-0.5;
  }

  &__title {
    @apply text-sm text-[color:var(--color-body-text)];
  }

  &__description {
    @apply text-xs text-gray-400;
  }
}
</style>
