<template>
  <div class="py-10 lg:py-24" :class="model.background">
    <div class="w-full max-w-screen-xl mx-auto px-14 lg:px-32">
      <div class="font-bold text-2xl lg:text-4xl mb-6 text-center">{{ model.title }}</div>
      <div class="text-base text-center">{{ model.subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  model: {
    type: Object,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
});
</script>
