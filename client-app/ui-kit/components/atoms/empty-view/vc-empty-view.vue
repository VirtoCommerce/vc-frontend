<template>
  <div class="vc-empty-view">
    <slot name="icon">
      <div class="vc-empty-view__icon">
        <VcIcon :name="icon" />
      </div>
    </slot>

    <slot>
      <div v-if="text" class="vc-empty-view__text">
        {{ text }}
      </div>
    </slot>

    <div v-if="$slots.button" class="vc-empty-view__buttons">
      <slot name="button" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IProp {
  text?: string;
  icon?: string;
}

withDefaults(defineProps<IProp>(), {
  icon: "thin-stock",
});
</script>

<style lang="scss">
.vc-empty-view {
  @apply flex grow flex-col items-center gap-4 py-20 px-6 text-center md:gap-5;

  &__icon {
    --vc-icon-size: 5.375rem;
    --vc-icon-color: theme("colors.primary.500");
  }

  &__text {
    @apply text-xl leading-tight;
  }
}
</style>
