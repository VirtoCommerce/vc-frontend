<template>
  <VcFrame class="secure-layout">
    <template #header>
      <SkipToLinks />

      <SecureHeader />
    </template>

    <slot />

    <template #footer>
      <VcFooter compact />
    </template>
  </VcFrame>
</template>

<script setup lang="ts">
import VcFooter from "../footer/vc-footer.vue";
import SkipToLinks from "../skip-to-links/skip-to-links.vue";
import SecureHeader from "./_internal/secure-header.vue";
</script>
