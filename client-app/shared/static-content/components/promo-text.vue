<template>
  <div class="py-10 lg:py-24" :class="model.background">
    <div class="mx-auto w-full max-w-screen-xl px-14 lg:px-32">
      <div class="mb-6 text-center text-2xl font-bold lg:text-4xl">{{ model.title }}</div>

      <div class="text-center text-base">{{ model.subtitle }}</div>
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
