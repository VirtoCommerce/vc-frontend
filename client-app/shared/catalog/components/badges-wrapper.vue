<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  @apply absolute -left-1 -top-1 flex items-center gap-2 rounded-br-lg bg-additional-50 z-[1];

  &:not(:empty) {
    @apply p-1.5;
  }
}
</style>
