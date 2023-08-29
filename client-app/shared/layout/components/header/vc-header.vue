<template>
  <!-- Mobile header -->
  <MobileHeader v-if="isMobile" />

  <!-- Desktop header -->
  <template v-else>
    <TopHeader class="relative z-[21] print:hidden" />
    <BottomHeader class="sticky top-0 z-20 shadow-md print:hidden" />
  </template>

  <div class="hidden items-start justify-between print:flex">
    <VcImage :src="$cfg.logo_image" :alt="$context.storeName" class="h-[3rem]" />

    <div class="rounded border border-[--color-neutral-100] p-2 text-xs">
      <div class="font-black">{{ $t("common.labels.created_date") }}</div>
      <div class="mt-1">{{ $d(new Date()) }}</div>
    </div>
  </div>
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
