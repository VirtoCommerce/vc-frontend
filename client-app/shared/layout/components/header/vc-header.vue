<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <TopHeader class="relative z-[21] print:hidden" />
    <BottomHeader class="sticky top-0 z-20 shadow-md print:hidden" />
  </template>

  <div class="hidden items-start justify-between print:flex">
    <VcImage :src="siteLogoUrl" :alt="$context.storeName" class="h-[3rem]" />

    <Created />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed } from "vue";
import { useThemeContext } from "@/core/composables";
import { useWhiteLabeling } from "@/shared/account";
import Created from "../print/created.vue";
import BottomHeader from "./_internal/bottom-header.vue";
import MobileHeader from "./_internal/mobile-header.vue";
import TopHeader from "./_internal/top-header.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const { themeContext } = useThemeContext();
const { whiteLabelingSettings } = useWhiteLabeling();

// For optimization on mobile devices
const isMobile = breakpoints.smaller("lg");

const siteLogoUrl = computed(() => whiteLabelingSettings.value?.logoUrl ?? themeContext.value?.settings?.logo_image);
</script>
