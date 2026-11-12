<template>
  <header class="minimal-header">
    <router-link class="minimal-header__home" :to="$context.settings.default_return_url ?? '/'">
      <VcImage :src="headerLogoUrl" :alt="$context.storeName" class="minimal-header__logo" lazy />
    </router-link>
  </header>
</template>

<script setup lang="ts">
import { useHeaderLogo } from "../../composables/useHeaderLogo";

const { headerLogoUrl } = useHeaderLogo();
</script>

<style lang="scss">
.minimal-header {
  @apply flex h-14 items-center bg-[--header-bottom-bg-color] px-6 text-[--header-bottom-text-color] shadow-md;

  @media (width >= theme("screens.lg")) {
    @apply h-auto px-12 py-5;
  }

  @media print {
    @apply shadow-none;
  }

  &__logo {
    @apply h-9;

    @media (width >= theme("screens.lg")) {
      @apply h-12;
    }
  }
}
</style>
