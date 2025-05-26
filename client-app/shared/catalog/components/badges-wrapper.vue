<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  @apply absolute flex gap-1 z-[1] flex-wrap max-w-full;
}
</style>
