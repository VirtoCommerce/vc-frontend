<template>
  <header ref="headerElement" class="secure-header">
    <router-link to="/" replace>
      <VcImage :src="logoUrl" :alt="$context.storeName" class="secure-header__logo" lazy />
    </router-link>

    <div class="secure-header__status">
      <SecureCheckoutBadge />

      <Created />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useCssVar, useElementBounding } from "@vueuse/core";
import { useTemplateRef, watch } from "vue";
import { useWhiteLabeling } from "@/core/composables";
import Created from "../../print/created.vue";
import SecureCheckoutBadge from "./secure-checkout-badge.vue";

const { logoUrl } = useWhiteLabeling();

const headerElement = useTemplateRef<HTMLElement>("headerElement");
const { height: headerHeight } = useElementBounding(headerElement);
// The sticky header's height for `html { scroll-padding-top }`; VcHeader (desktop) and MobileHeader write it on
// Main pages.
const appHeaderHeightVar = useCssVar("--vc-app-header-height");

watch(
  headerHeight,
  (value) => {
    appHeaderHeightVar.value = `${value}px`;
  },
  { immediate: true },
);
</script>

<style lang="scss">
.secure-header {
  @apply sticky top-0 z-20 flex h-14 items-center justify-between gap-3 bg-additional-50 px-6 shadow-md;

  margin-inline: var(--vc-frame-header-offset-x, 0px);

  @media (width >= theme("screens.lg")) {
    @apply h-auto px-12 py-5;
  }

  @media print {
    @apply relative px-0 shadow-none;
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
