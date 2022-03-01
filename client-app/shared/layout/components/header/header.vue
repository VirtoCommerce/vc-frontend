<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <div v-else class="z-10 shadow-md">
    <TopHeader />
    <BottomHeader />
  </div>
</template>

<script setup lang="ts">
import TopHeader from "./_internal/top-header.vue";
import BottomHeader from "./_internal/bottom-header.vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import MobileHeader from "@/shared/layout/components/header/_internal/mobile-header.vue";

const breakpoints = useBreakpoints(breakpointsTailwind);

// For optimization on mobile devices
const isMobile = breakpoints.smaller("lg");
</script>
