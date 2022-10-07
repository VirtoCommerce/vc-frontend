<template>
  <div class="bg-gray-800 py-10 lg:py-24">
    <div class="w-full max-w-screen-xl mx-auto px-5 md:px-12">
      <div class="flex flex-col lg:block justify-between items-center space-y-10">
        <div class="font-bold text-2xl lg:text-3xl text-white text-center">{{ model.title }}</div>
        <div class="flex w-full items-center justify-center space-x-6">
          <VcButton
            v-for="(item, index) in model.buttons"
            :key="index"
            :to="item.link"
            class="w-1/2 lg:w-auto uppercase px-8"
          >
            {{ item.label }}
          </VcButton>
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
