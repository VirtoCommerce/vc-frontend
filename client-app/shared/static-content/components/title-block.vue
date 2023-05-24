<template>
  <div class="pb-16 pt-6 lg:py-24">
    <div class="mx-auto w-full max-w-screen-2xl px-5 md:px-12">
      <component :is="model.heading" class="text-2xl">{{ model.title }}</component>
      <p>{{ model.subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  model: {
    type: Object,
    required: true,
  },
});
</script>
