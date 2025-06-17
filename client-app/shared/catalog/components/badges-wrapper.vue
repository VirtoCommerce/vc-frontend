<template>
  <div class="badges-wrapper">
    <slot />
  </div>
</template>

<style lang="scss">
@reference "tailwindcss";

.badges-wrapper {
  @apply absolute flex gap-0.5 z-[1];
}
</style>
