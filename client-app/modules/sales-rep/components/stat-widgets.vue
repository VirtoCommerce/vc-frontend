<template>
  <div class="stat-widgets">
    <slot />
  </div>
</template>

<style lang="scss">
// Layout-only wrapper for a row of <StatWidget> cards.
// @apply: module is self-contained as an MF remote (no global utility layer).
.stat-widgets {
  // Count-agnostic: as many equal columns as fit (min 11rem each), one rule for both the 6-card
  // dashboard row and the 5-card customer profile.
  @apply grid gap-4;

  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
}
</style>
