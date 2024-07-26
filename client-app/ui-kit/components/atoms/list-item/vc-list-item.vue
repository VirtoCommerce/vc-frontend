<template>
  <li class="vc-list-item">
    <slot name="title">
      <div class="vc-list-item__title">{{ title }}</div>
    </slot>
    <slot>
      <div class="vc-list-item__description">
        {{ description }}
      </div>
    </slot>
  </li>
</template>

<script setup lang="ts">
interface IProps {
  title?: string;
  description?: string;
}

defineProps<IProps>();
</script>

<style scoped lang="scss">
.vc-list-item {
  @apply marker:text-xl marker:text-primary;

  &__title {
    @apply font-black;
  }

  &__description {
    @apply text-sm;
  }
}
</style>
