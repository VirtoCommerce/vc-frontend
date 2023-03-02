<template>
  <button type="button" class="vc-action-button">
    <i v-if="icon" :class="['vc-action-button__icon', icon]" />
    <span class="vc-action-button__text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "",
  },
});
</script>

<style scoped lang="scss">
.vc-action-button {
  @apply flex grow flex-col items-center justify-center text-white;

  &__icon {
    @apply text-xl leading-none mb-1.5;
  }

  &__text {
    @apply block font-roboto text-sm text-center leading-none;
  }
}
</style>
