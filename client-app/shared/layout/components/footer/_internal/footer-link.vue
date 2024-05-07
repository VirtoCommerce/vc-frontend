<template>
  <router-link class="footer-link" :to="to">
    <slot>{{ title }}</slot>
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  to: RouteLocationRaw;
  title?: string;
}

defineProps<IProps>();
</script>

<style lang="scss">
.footer-link {
  @apply text-xs font-medium text-[--footer-top-link-color];

  &:hover {
    @apply text-[--footer-top-link-hover-color];
  }

  &.router-link-active {
    @apply text-[--footer-top-link-active-color];
  }
}
</style>
