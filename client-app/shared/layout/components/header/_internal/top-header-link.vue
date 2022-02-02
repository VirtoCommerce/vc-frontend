<template>
  <router-link class="text-blue-400 hover:text-blue-500" :to="to">
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
