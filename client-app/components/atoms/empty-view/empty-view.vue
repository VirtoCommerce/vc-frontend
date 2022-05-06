<template>
  <div class="flex grow flex-col items-center justify-center space-y-5" :class="{ 'h-96': isMobile }">
    <slot name="icon"></slot>
    <p class="text-xl">
      {{ text }}
    </p>
    <slot name="button"></slot>
  </div>
</template>
<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";

defineProps({
  text: {
    type: String,
    default: "",
  },
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
</script>
