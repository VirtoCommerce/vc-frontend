<template>
  <div class="main-layout">
    <SkipToLinks />

    <VcHeader v-if="chrome === 'full'" />

    <MinimalHeader v-else-if="chrome === 'minimal'" />

    <!-- Main Content -->
    <main id="main-content" class="main-layout__content">
      <slot />
    </main>

    <VcFooter v-if="chrome === 'full'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isNewPageBuilderEnabled } from "@/core/theme-snapshot";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import VcFooter from "@/shared/layout/components/footer/vc-footer.vue";
import VcHeader from "@/shared/layout/components/header/vc-header.vue";
import MinimalHeader from "@/shared/layout/components/minimal-header/minimal-header.vue";
import SkipToLinks from "@/shared/layout/components/skip-to-links/skip-to-links.vue";

const { pageLayout } = usePageLayout();

/**
 * The header and footer around the page, switched here so the page under them is never remounted. Without the new
 * Page Builder every page keeps the full layout.
 */
const chrome = computed(() => (isNewPageBuilderEnabled() ? pageLayout.value : "full"));
</script>

<style lang="scss">
.main-layout {
  @apply flex min-h-screen flex-col;

  &__content {
    @apply relative flex grow flex-col min-h-[60vh];
  }
}
</style>
