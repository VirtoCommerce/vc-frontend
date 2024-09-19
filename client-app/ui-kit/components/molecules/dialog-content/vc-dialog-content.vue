<template>
  <div class="vc-dialog-content">
    <slot />
  </div>
</template>

<style lang="scss">
.vc-dialog-content {
  grid-area: vc-dialog-content;

  @apply py-2 px-6 max-h-full overflow-y-auto;

  @at-root *:has(:not(.vc-dialog-footer)) > & {
    @apply pb-4;
  }

  @at-root *:has(:not(.vc-dialog-header)) > & {
    @apply pt-4;
  }
}
</style>
