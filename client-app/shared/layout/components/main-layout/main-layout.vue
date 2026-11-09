<template>
  <div class="main-layout">
    <SkipToLinks :with-footer="chrome === 'full'" />

    <!-- Kept alive, so a page on another layout does not make them mount and load their menus again -->
    <KeepAlive>
      <VcHeader v-if="chrome === 'full'" />

      <MinimalHeader v-else-if="chrome === 'minimal'" />
    </KeepAlive>

    <!-- Main Content -->
    <main id="main-content" class="main-layout__content">
      <slot />
    </main>

    <KeepAlive>
      <VcFooter v-if="chrome === 'full'" />
    </KeepAlive>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isNewPageBuilderEnabled, useThemeSnapshot } from "@/core/theme-snapshot";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import VcFooter from "@/shared/layout/components/footer/vc-footer.vue";
import VcHeader from "@/shared/layout/components/header/vc-header.vue";
import MinimalHeader from "@/shared/layout/components/minimal-header/minimal-header.vue";
import SkipToLinks from "@/shared/layout/components/skip-to-links/skip-to-links.vue";

const { pageLayout } = usePageLayout();
const { hasNoTheme } = useThemeSnapshot();

/** Switched here so the page under the header and footer is never remounted. */
const chrome = computed(() => (isNewPageBuilderEnabled() && !hasNoTheme.value ? pageLayout.value : "full"));
</script>

<style lang="scss">
.main-layout {
  @apply flex min-h-screen flex-col;

  &__content {
    @apply relative flex grow flex-col min-h-[60vh];
  }
}
</style>
