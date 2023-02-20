<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <TopHeader class="relative z-[21]" />
    <BottomHeader class="sticky top-0 z-20 shadow-md" />
  </template>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import BottomHeader from "./_internal/bottom-header.vue";
import MobileHeader from "./_internal/mobile-header.vue";
import TopHeader from "./_internal/top-header.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);

// For optimization on mobile devices
const isMobile = breakpoints.smaller("lg");
</script>
