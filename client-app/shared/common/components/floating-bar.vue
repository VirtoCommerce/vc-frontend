<template>
  <div class="floating-bar">
    <slot />
  </div>
</template>

<style lang="scss">
.floating-bar {
  @apply z-10 sticky bottom-0 px-6 py-4 bg-additional-50;

  box-shadow: 0px -9px 15px -3px rgba(0, 0, 0, 0.08);
}
</style>
