<template>
  <div class="main-layout">
    <SkipToLinks />

    <VcHeader />

    <!-- Main Content -->
    <main id="main-content" class="main-layout__content">
      <slot />
    </main>

    <VcFooter />
  </div>
</template>

<script setup lang="ts">
import VcFooter from "@/shared/layout/components/footer/vc-footer.vue";
import VcHeader from "@/shared/layout/components/header/vc-header.vue";
import SkipToLinks from "@/shared/layout/components/skip-to-links/skip-to-links.vue";
</script>

<style lang="scss">
.main-layout {
  @apply flex min-h-screen flex-col;

  &__content {
    @apply relative flex grow flex-col min-h-[60vh];
  }
}
</style>
