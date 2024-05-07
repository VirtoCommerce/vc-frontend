<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <TopHeader class="relative z-[21] print:hidden" />
    <BottomHeader class="sticky top-0 z-20 shadow-md print:hidden" />
  </template>

  <div class="hidden items-start justify-between print:flex">
    <VcImage :src="logoUrl" :alt="$context.storeName" class="h-[3rem]" />

    <Created />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useWhiteLabeling } from "@/core/composables";
import Created from "../print/created.vue";
import BottomHeader from "./_internal/bottom-header.vue";
import MobileHeader from "./_internal/mobile-header.vue";
import TopHeader from "./_internal/top-header.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);
const { logoUrl } = useWhiteLabeling();

// For optimization on mobile devices
const isMobile = breakpoints.smaller("lg");
</script>
