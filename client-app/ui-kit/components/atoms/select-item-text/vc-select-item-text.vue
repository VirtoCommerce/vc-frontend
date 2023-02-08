<template>
  <span class="vc-select-item-text">
    <span class="vc-select-item-text__title">
      <slot />
    </span>

    <span v-if="$slots.description" class="vc-select-item-text__description">
      <slot name="description" />
    </span>
  </span>
</template>

<style lang="scss">
.vc-select-item-text {
  @apply grow flex flex-col min-w-0;

  &__title {
    @apply text-sm text-[color:var(--color-body-text)] truncate;
  }

  &__description {
    @apply text-xs leading-[0.875rem] text-gray-400 line-clamp-2;
  }
}
</style>
