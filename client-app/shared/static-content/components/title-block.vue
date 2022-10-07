<template>
  <div class="pt-6 pb-16 lg:py-24">
    <div class="w-full max-w-screen-2xl mx-auto px-5 md:px-12">
      <h2 v-if="model.heading == 'h2'" class="text-2xl">{{ model.title }}</h2>
      <h3 v-if="model.heading == 'h3'" class="text-2xl">{{ model.title }}</h3>
      <h4 v-if="model.heading == 'h4'" class="text-2xl">{{ model.title }}</h4>
      <h5 v-if="model.heading == 'h5'" class="text-2xl">{{ model.title }}</h5>
      <h6 v-if="model.heading == 'h6'" class="text-2xl">{{ model.title }}</h6>
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
