<template>
  <router-link
    class="py-1 font-bold text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
    :to="to"
  >
    <slot />
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
});
</script>
