<template>
  <div class="stat-widgets">
    <slot />
  </div>
</template>

<style lang="scss">
// Layout-only wrapper for a row of <StatWidget> cards. `@apply` keeps the module self-contained
// as an MF remote (no global utility layer). See PORT_TO_MF.md.
.stat-widgets {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4;
}
</style>
