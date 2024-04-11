<template>
  <router-link class="footer-link text-xs font-medium text-neutral-400 hover:text-additional-50" :to="to">
    <slot>{{ title }}</slot>
  </router-link>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";

defineProps({
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    required: true,
  },

  title: {
    type: String,
    default: undefined,
  },
});
</script>

<style>
.footer-link.router-link-active {
  @apply text-additional-50;
}
</style>
