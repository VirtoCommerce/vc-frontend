<template>
  <div>
    <h1 class="text-2xl">{{ model.header }}</h1>
    <div class="text-lg" v-html="model.text"></div>
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
