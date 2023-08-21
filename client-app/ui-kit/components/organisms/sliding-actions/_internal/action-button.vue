<template>
  <button type="button" class="vc-action-button">
    <VcIcon v-if="icon" class="vc-action-button__icon" :name="icon" />

    <span class="vc-action-button__text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface IProps {
  icon?: string;
}

defineProps<IProps>();
</script>

<style scoped lang="scss">
.vc-action-button {
  @apply flex grow flex-col items-center justify-center text-white;

  &__icon {
    @apply mb-1.5;
  }

  &__text {
    @apply block text-sm text-center leading-none;
  }
}
</style>
