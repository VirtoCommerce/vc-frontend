<template>
  <div class="vc-dialog-content">
    <slot name="container">
      <div class="vc-dialog-content__container">
        <slot />
      </div>
    </slot>
  </div>
</template>

<style lang="scss">
.vc-dialog-content {
  grid-area: vc-dialog-content;

  @apply max-h-full overflow-y-auto;

  &__container {
    @apply py-2 px-6;

    @at-root *:has(:not(.vc-dialog-footer)) > & {
      @apply pb-4;
    }

    @at-root *:has(:not(.vc-dialog-header)) > & {
      @apply pt-4;
    }
  }
}
</style>
