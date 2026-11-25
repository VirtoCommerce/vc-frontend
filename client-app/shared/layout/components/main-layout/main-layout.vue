<template>
  <VcFrame class="main-layout">
    <template #header>
      <SkipToLinks :with-footer="chrome === 'full'" />

      <!-- Kept alive, so a page on another layout does not make them mount and load their menus again -->
      <KeepAlive>
        <AppHeader v-if="chrome === 'full'" />

        <MinimalHeader v-else-if="chrome === 'minimal'" />
      </KeepAlive>
    </template>

    <slot />

    <template #footer>
      <KeepAlive>
        <VcFooter v-if="chrome === 'full'" />
      </KeepAlive>
    </template>
  </VcFrame>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import VcFooter from "@/shared/layout/components/footer/vc-footer.vue";
import AppHeader from "@/shared/layout/components/header/app-header.vue";
import MinimalHeader from "@/shared/layout/components/minimal-header/minimal-header.vue";
import SkipToLinks from "@/shared/layout/components/skip-to-links/skip-to-links.vue";

const { pageLayout } = usePageLayout();
const { isThemeApplied } = useThemeSnapshot();

/** Switched here so the page under the header and footer is never remounted. */
const chrome = computed(() => (isThemeApplied() ? pageLayout.value : "full"));
</script>

<style lang="scss">
.main-layout {
  --vc-frame-main-min-height: 60vh;
}
</style>
