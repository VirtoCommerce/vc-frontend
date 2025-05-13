<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
.badges-wrapper {
  @apply absolute flex gap-0.5 z-[1];
}
</style>
