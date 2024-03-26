<template>
  <transition
    :appear="appear"
    :mode="mode"
    enter-from-class="scale-0"
    leave-to-class="scale-0"
    enter-active-class="will-change-transform"
    leave-active-class="will-change-transform"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
import type { PropType, TransitionProps } from "vue";

defineProps({
  appear: Boolean,
  mode: String as PropType<TransitionProps["mode"]>,
});

console.warn("[UIKit][warn] VcTransitionScale is deprecated, use vue's <transition> directly instead.");
</script>
