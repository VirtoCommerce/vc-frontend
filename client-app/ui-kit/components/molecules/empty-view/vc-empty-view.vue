<template>
  <div class="vc-empty-view">
    <slot name="icon">
      <div v-if="variant === 'search'" class="vc-empty-view__search-icon" v-html="nothingFoundImgRaw" />

      <VcIcon v-else-if="variant === 'empty' && icon" class="vc-empty-view__icon" :name="icon" />
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
import nothingFoundImgRaw from "@/ui-kit/images/nothing-found.svg?raw";

interface IProp {
  text?: string;
  icon?: string;
  variant?: VcEmptyViewVariantType;
}

withDefaults(defineProps<IProp>(), {
  variant: "empty",
});
</script>

<style lang="scss">
.vc-empty-view {
  @apply flex grow flex-col items-center gap-4 py-20 px-6 text-center;

  @media (min-width: theme("screens.md")) {
    @apply gap-5;
  }

  &__search-icon {
    @apply size-[9.75rem];
  }

  &__icon {
    --vc-icon-size: 5.375rem;
    --vc-icon-color: theme("colors.primary.500");
  }

  &__text {
    @apply text-xl leading-tight;
  }
}
</style>
