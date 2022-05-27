<template>
  <router-link
    class="font-medium text-xs text-[color:var(--color-footer-top-link)] hover:text-[color:var(--color-footer-top-link-hover)]"
    :to="to"
  >
    <slot>{{ title }}</slot>
  </router-link>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { RouteLocationRaw } from "vue-router";

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
