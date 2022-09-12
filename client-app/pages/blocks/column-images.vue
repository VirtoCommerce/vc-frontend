<template>
  <div class="py-10 lg:py-24" :class="model.background">
    <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
      <div class="font-bold text-2xl lg:text-5xl mb-6 text-center">{{ model.title }}</div>
      <div class="text-base text-center">{{ model.subtitle }}</div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-20 gap-y-10 items-center mt-16 px-8 lg:px-0">
        <div v-for="(item, index) in model.columns" :key="index" class="text-center">
          <VcImage :src="item.image" class="h-24 mx-auto mb-9" lazy />
          <div class="font-roboto-condensed uppercase font-bold text-2xl mb-3">{{ item.title }}</div>
          <div class="text-sm">{{ item.text }}</div>
        </div>
      </div>
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
