<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  @apply absolute flex items-center gap-1 z-[1];
}
</style>
