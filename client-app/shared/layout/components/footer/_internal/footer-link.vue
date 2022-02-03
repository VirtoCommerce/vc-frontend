<template>
  <router-link class="font-medium text-xs text-gray-400 hover:text-gray-300" :to="to">
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
