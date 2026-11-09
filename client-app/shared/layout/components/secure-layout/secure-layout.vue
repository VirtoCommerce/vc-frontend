<template>
  <VcFrame class="secure-layout">
    <template #header>
      <SkipToLinks />

      <div class="secure-layout__header">
        <router-link to="/" replace>
          <VcImage :src="logoUrl" :alt="$context.storeName" class="secure-layout__logo" lazy />
        </router-link>

        <div class="secure-layout__status">
          <SecureCheckoutBadge />

          <Created />
        </div>
      </div>
    </template>

    <slot />

    <template #footer>
      <VcFooter compact />
    </template>
  </VcFrame>
</template>

<script setup lang="ts">
import { useWhiteLabeling } from "@/core/composables";
import VcFooter from "../footer/vc-footer.vue";
import Created from "../print/created.vue";
import SkipToLinks from "../skip-to-links/skip-to-links.vue";
import SecureCheckoutBadge from "./_internal/secure-checkout-badge.vue";

const { logoUrl } = useWhiteLabeling();
</script>

<style lang="scss">
.secure-layout {
  &__header {
    @apply sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-additional-50 px-6 shadow-md;

    @media (width >= theme("screens.lg")) {
      @apply h-auto px-12 py-5;
    }

    @media print {
      @apply relative px-0 shadow-none;
    }
  }

  &__logo {
    @apply h-9;

    @media (width >= theme("screens.lg")) {
      @apply h-12;
    }

    @media print {
      @apply h-12;
    }
  }

  &__status {
    @apply flex;
  }
}
</style>
