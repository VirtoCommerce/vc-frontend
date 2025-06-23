<template>
  <div class="vc-loader"></div>
</template>

<style lang="scss">
@reference "tailwindcss";

.vc-loader {
  @apply inline-block size-7 animate-spin rounded-full border-4 border-primary-100 border-r-primary;
}
</style>
