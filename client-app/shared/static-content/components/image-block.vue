<template>
  <div class="pt-6 pb-16 lg:py-24">
    <div class="w-full max-w-screen-2xl mx-auto px-5 md:px-12">
      <img :src="model.image" />
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
