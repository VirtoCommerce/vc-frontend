<template>
  <VcFrame class="main-layout">
    <template #header>
      <SkipToLinks />

      <VcHeader />
    </template>

    <slot />

    <template #footer>
      <VcFooter />
    </template>
  </VcFrame>
</template>

<script setup lang="ts">
import VcFooter from "@/shared/layout/components/footer/vc-footer.vue";
import VcHeader from "@/shared/layout/components/header/vc-header.vue";
import SkipToLinks from "@/shared/layout/components/skip-to-links/skip-to-links.vue";
</script>

<style lang="scss">
.main-layout {
  --vc-frame-main-min-height: 60vh;
}
</style>
