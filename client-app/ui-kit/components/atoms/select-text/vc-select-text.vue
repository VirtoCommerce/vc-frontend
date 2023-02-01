<template>
  <span class="vc-select-text">
    <span class="vc-select-text__title">
      <slot />
    </span>
    <span class="vc-select-text__description">
      <slot name="description" />
    </span>
  </span>
</template>

<style lang="scss">
.vc-select-text {
  @apply grow order-2 flex flex-col min-w-0;

  &__title {
    @apply text-sm text-[color:var(--color-body-text)] truncate;
  }

  &__description {
    @apply text-xs leading-[0.875rem] text-gray-400 line-clamp-2 empty:hidden;
  }
}
</style>
