<template>
  <div :class="['vc-loader-with-text', { 'vc-loader-with-text--centered': centered }]">
    <VcLoader class="vc-loader-with-text__loader" />

    <span class="vc-loader-with-text__text">
      {{ text ?? $t("ui_kit.messages.loading_text") }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface IProps {
  centered?: boolean;
  text?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.vc-loader-with-text {
  @apply flex items-center gap-2;

  &--centered {
    @apply justify-center;
  }

  &__loader {
    @apply inline-block size-6 text-primary;
  }

  &__text {
    @apply animate-pulse font-bold;
  }
}
</style>
