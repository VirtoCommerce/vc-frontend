<template>
  <router-link class="top-header-link" exact-active-class="top-header-link--active" :to="to">
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  to: RouteLocationRaw;
}

defineProps<IProps>();
</script>

<style lang="scss">
.top-header-link {
  @apply py-1 font-bold text-[--header-top-link-color] hover:text-[--header-top-link-hover-color];

  &--active {
    @apply text-[--header-top-link-active-color];
  }
}
</style>
