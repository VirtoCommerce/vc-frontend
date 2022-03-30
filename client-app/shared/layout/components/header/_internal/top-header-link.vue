<template>
  <router-link
    class="text-[color:var(--color-header-top-link)] hover:text-[color:var(--color-header-top-link-hover)]"
    :to="to"
  >
    <slot>{{ title }}</slot>
  </router-link>
</template>

<script setup lang="ts">
defineProps({
  to: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    default: undefined,
  },
});
</script>
