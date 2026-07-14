<template>
  <div class="variation-property">
    <div class="variation-property__label">
      {{ label }}
    </div>

    <div class="variation-property__value">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  label?: string;
}

withDefaults(defineProps<IProps>(), {
  label: "",
});
</script>

<style lang="scss">
.variation-property {
  @apply flex gap-x-3 text-sm;

  &__label {
    @apply w-1/2 text-neutral;

    @media (width >= theme("screens.xl")) {
      @apply w-2/5;
    }
  }

  &__value {
    @apply line-clamp-3 w-1/2 font-bold;

    @media (width >= theme("screens.xl")) {
      @apply w-3/5;
    }
  }
}
</style>
